variable "aws_region" {
  description = "AWS region for the S3 bucket and regional resources. ACM for CloudFront is always us-east-1 regardless of this value."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Apex domain to serve the site on (e.g. example.com). Read from the GitHub Actions variable DOMAIN_NAME via TF_VAR_domain_name."
  type        = string

  validation {
    condition     = length(trimspace(var.domain_name)) > 0
    error_message = "domain_name must not be empty."
  }
}

variable "route53_zone_id" {
  description = "ID of the existing Route53 hosted zone for domain_name. Read from the GitHub Actions variable ROUTE53_ZONE_ID via TF_VAR_route53_zone_id."
  type        = string

  validation {
    condition     = length(trimspace(var.route53_zone_id)) > 0
    error_message = "route53_zone_id must not be empty."
  }
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 is cheapest (NA + EU edge locations)."
  type        = string
  default     = "PriceClass_100"
}

variable "default_root_object" {
  description = "Object CloudFront returns for a request to the root path."
  type        = string
  default     = "index.html"
}
