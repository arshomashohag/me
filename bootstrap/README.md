# Bootstrap (CloudFormation)

One-time prerequisites for the deploy pipeline, as a CloudFormation stack you
run **directly in your AWS account**. It creates:

- The **Terraform remote-state backend** — an S3 bucket (versioned, encrypted,
  private) and a DynamoDB lock table.
- The **deploy IAM role** that GitHub Actions assumes via OIDC. Its policy is
  least-privilege by **resource** where that is meaningful — state bucket/table
  and the `<domain>-site` S3 bucket are scoped by ARN — and by **service** for
  CloudFront/ACM/Route53, whose create/read/tag calls are not resource-scopable.
  The role can touch nothing else in the account.

It **references an existing** GitHub OIDC provider (passed as a parameter) — it
does not create one, since an account may only have a single provider for
`token.actions.githubusercontent.com`.

## Prerequisites

- A GitHub Actions OIDC provider already exists in the account. Find its ARN:

  ```bash
  aws iam list-open-id-connect-providers
  # -> arn:aws:iam::<account>:oidc-provider/token.actions.githubusercontent.com
  ```

  If you don't have one yet, create it first:

  ```bash
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com
  ```

## Deploy the stack

This account has GitHub's **immutable-ID subject** enabled, so the OIDC `sub`
claim carries numeric IDs (e.g.
`repo:arshomashohag@20051700/me@1331555648:ref:refs/heads/main`) rather than the
org/repo path. AWS requires a GitHub-OIDC trust policy to constrain `sub` (or
`job_workflow_ref`), so the policy matches the **`sub` prefix** with `StringLike`
and additionally asserts the `repository_owner_id` / `repository_id` claims.

Read the exact `sub` prefix from a CloudTrail `AssumeRoleWithWebIdentity` event
(the `userName` / `principalId` field), or decode the OIDC token in an Actions
run. It is everything before the final `:ref:...` segment. Also look up the IDs:

```bash
curl -s https://api.github.com/users/arshomashohag | jq .id   # owner id
curl -s https://api.github.com/repos/arshomashohag/me | jq .id # repo id
```

```bash
aws cloudformation deploy \
  --stack-name portfolio-bootstrap \
  --template-file bootstrap/bootstrap.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1 \
  --parameter-overrides \
    GitHubSubjectPrefix='repo:arshomashohag@20051700/me@1331555648' \
    GitHubRepositoryOwnerId=20051700 \
    GitHubRepositoryId=1331555648 \
    OidcProviderArn=arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com \
    StateBucketName=arshomashohag-portfolio-tfstate \
    LockTableName=portfolio-tf-lock \
    DomainName=example.com
```

Notes:

- `--capabilities CAPABILITY_NAMED_IAM` is required because the stack creates a
  named IAM role (`portfolio-deploy`).
- `GitHubSubjectPrefix` must **not** include the trailing `:*` — the template
  appends it. The `StringLike` match is **branch-agnostic** (any branch in the
  repo can deploy).
- `DomainName` is optional; if set, the deploy role's S3 permissions are scoped
  to the `<domain>-site` origin bucket. Leave it empty to allow any `*-site`
  bucket.

## After it completes

Read the stack outputs and wire them into GitHub
(**Settings → Secrets and variables → Actions**):

```bash
aws cloudformation describe-stacks \
  --stack-name portfolio-bootstrap \
  --region us-east-1 \
  --query 'Stacks[0].Outputs' --output table
```

| Stack output      | GitHub setting                       | Kind     |
| ----------------- | ------------------------------------ | -------- |
| `DeployRoleArn`   | `AWS_DEPLOY_ROLE_ARN`                | secret   |
| `StateBucketName` | `TF_STATE_BUCKET`                    | variable |
| `LockTableName`   | `TF_STATE_LOCK_TABLE`                | variable |

Then set the remaining GitHub variables (`AWS_REGION`, `DOMAIN_NAME`,
`ROUTE53_ZONE_ID`) as described in the top-level `README.md`, and the deploy
workflow can run.

## Tearing down

The state bucket has `DeletionPolicy: Retain`, so deleting the stack leaves the
bucket (and your Terraform state) in place. Empty and delete it manually if you
really want it gone.
