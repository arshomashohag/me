# Portfolio — Md. Shohag Mia

A static personal portfolio for **Md. Shohag Mia** — Software Engineer · Cloud & Backend.

This is a plain, self-contained reproduction of a
[Claude Design](https://claude.com/product/design) artifact, rebuilt as
standard HTML/CSS/JS with **no build step** and **no runtime dependencies**.
The original artifact runs on a proprietary component runtime; this version
ports that behavior to vanilla JavaScript so it deploys to any static host and
makes **zero external network requests** at runtime (fonts are self-hosted).

## File structure

```
portfolio/
├── index.html      # All sections + inline SVG architecture diagrams
├── styles.css      # Design-system tokens (:root) + component classes
├── script.js       # Responsive nav, scroll-reveal, active-nav highlight
├── fonts/          # Self-hosted Archivo (variable woff2, latin + latin-ext)
└── README.md
```

## Run locally

No build or install is needed. Either open the file directly:

```bash
open index.html
```

…or serve it over a local HTTP server (recommended, so fonts load with the
right headers):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

The site is fully static — no server-side code, no build pipeline.

### AWS (S3 + CloudFront + Route53) via Terraform + GitHub Actions

This is the primary deployment path. Infrastructure lives in `terraform/`
and is applied by the `Deploy site` GitHub Actions workflow
(`.github/workflows/deploy.yml`), which then syncs the files to S3 and
invalidates the CloudFront cache.

**Architecture:**

- Private **S3** bucket (`<domain>-site`) as origin — reachable only through
  CloudFront via Origin Access Control (OAC).
- **CloudFront** distribution serving the apex domain over HTTPS, with an
  **ACM** certificate (DNS-validated, in `us-east-1` as CloudFront requires).
- **Route53** apex `A`/`AAAA` alias records into your existing hosted zone.
- CI authenticates to AWS with **GitHub OIDC** — no long-lived AWS keys are
  stored in GitHub.

**Domain, hosted zone, and region are read from GitHub Actions variables** and
passed to Terraform as `TF_VAR_*`, so nothing environment-specific is committed.

#### One-time bootstrap (run locally with AWS admin credentials)

1. **Terraform remote state** — create an S3 bucket and DynamoDB lock table
   (names are your choice; you'll reference them as GitHub variables):

   ```bash
   aws s3api create-bucket --bucket <state-bucket> --region <region> \
     --create-bucket-configuration LocationConstraint=<region>
   aws s3api put-bucket-versioning --bucket <state-bucket> \
     --versioning-configuration Status=Enabled
   aws dynamodb create-table --table-name <lock-table> \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST --region <region>
   ```

2. **GitHub OIDC provider + deploy role** — create the IAM OIDC provider for
   `token.actions.githubusercontent.com` and an IAM role whose trust policy
   allows this repository to assume it (condition on
   `token.actions.githubusercontent.com:sub` = `repo:<owner>/<repo>:*`). Grant
   the role permissions for S3, CloudFront, ACM, Route53, and the state
   bucket/table. Note the role ARN.

#### GitHub configuration

In **Settings → Secrets and variables → Actions**:

- **Secret** `AWS_DEPLOY_ROLE_ARN` — the deploy role ARN from bootstrap step 2.
- **Variables:**
  - `AWS_REGION` — e.g. `us-east-1`
  - `DOMAIN_NAME` — apex domain, e.g. `example.com`
  - `ROUTE53_ZONE_ID` — existing hosted zone ID for `DOMAIN_NAME`
  - `TF_STATE_BUCKET` — the state bucket from bootstrap step 1
  - `TF_STATE_LOCK_TABLE` — the lock table from bootstrap step 1

#### Deploying

Push to `main` (touching site files or `terraform/`) or run the workflow
manually via **Actions → Deploy site → Run workflow**. The workflow runs
`terraform apply`, syncs the files, and invalidates the cache. The site
publishes at `https://<DOMAIN_NAME>`.

To apply the infrastructure locally instead:

```bash
cd terraform
terraform init \
  -backend-config="bucket=<state-bucket>" \
  -backend-config="dynamodb_table=<lock-table>" \
  -backend-config="region=<region>" \
  -backend-config="key=portfolio/terraform.tfstate"
export TF_VAR_domain_name=example.com
export TF_VAR_route53_zone_id=Z0123456789ABCDEFGHIJ
export TF_VAR_aws_region=us-east-1
terraform apply
```

### GitHub Pages (alternative)

1. Push this repository to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
4. Your site publishes at `https://<username>.github.io/<repo>/`.

### Netlify (alternative)

- **Drag-and-drop:** open <https://app.netlify.com/drop> and drop this folder.
- **Git-based:** connect the repository in Netlify. Leave the *build command*
  empty and set the *publish directory* to the project root (`.`).

## Notes

- **Fonts:** Archivo is bundled locally in `fonts/` and wired via `@font-face`
  with `font-display: swap`; the fallback is `system-ui, sans-serif`.
- **Accessibility:** respects `prefers-reduced-motion` — animations and smooth
  scrolling are disabled for users who ask for reduced motion.
- **Light mode only**, matching the original design.
