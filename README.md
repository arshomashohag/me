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

#### One-time bootstrap

The Terraform remote-state backend (S3 bucket + DynamoDB lock table) and the
GitHub OIDC deploy role are created by a CloudFormation stack you run once in
your AWS account. See [`bootstrap/README.md`](bootstrap/README.md) for the
`aws cloudformation deploy` command and parameters. Its outputs
(`DeployRoleArn`, `StateBucketName`, `LockTableName`) feed directly into the
GitHub configuration below.

The stack references an **existing** GitHub OIDC provider; create one first if
your account doesn't have it (commands are in the bootstrap README).

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
