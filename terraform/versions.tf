terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # Remote state in S3 with a DynamoDB lock table.
  # Values are supplied at init time via `-backend-config` (see README /
  # the deploy workflow) so the bucket/table names are not hard-coded here.
  backend "s3" {
    key     = "portfolio/terraform.tfstate"
    encrypt = true
  }
}
