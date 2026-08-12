# CNAME for the site subdomain pointing at the CloudFront distribution.
# A CNAME is valid here because the site is served on a subdomain (a CNAME
# cannot exist at a zone apex — that is why an apex would need an alias record).
resource "aws_route53_record" "site_cname" {
  zone_id = var.route53_zone_id
  name    = local.site_fqdn
  type    = "CNAME"
  ttl     = 300
  records = [aws_cloudfront_distribution.site.domain_name]
}
