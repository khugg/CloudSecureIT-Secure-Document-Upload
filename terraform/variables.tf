variable "resource_group_name" {
  type    = string
  default = "cloudsecureit-rg"
}

variable "location" {
  type    = string
  default = "Canada Central"
}

variable "storage_account_name" {
  type    = string
  default = "cloudsecureitstorage01"
}

variable "container_name" {
  type    = string
  default = "documents"
}

variable "acr_name" {
  type    = string
  default = "cloudsecureitacr01"
}

variable "app_service_plan_name" {
  type    = string
  default = "cloudsecureit-plan"
}

variable "web_app_name" {
  type    = string
  default = "cloudsecureit-app-01"
}
