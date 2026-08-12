locals {
  # Fully-qualified host the site is served on, e.g. shohag.example.com.
  site_fqdn = "${var.site_host}.${var.domain_name}"
}
