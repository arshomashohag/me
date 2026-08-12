# Default provider — region is configurable (defaults to us-east-1).
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "portfolio"
      ManagedBy = "terraform"
      Domain    = var.domain_name
    }
  }
}

# CloudFront requires its ACM certificate to live in us-east-1, regardless of
# the region the rest of the stack runs in. This aliased provider is used only
# for the certificate + its validation records' cert association.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "portfolio"
      ManagedBy = "terraform"
      Domain    = var.domain_name
    }
  }
}
