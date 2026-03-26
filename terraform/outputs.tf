output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "web_app_url" {
  value = "https://${azurerm_linux_web_app.webapp.default_hostname}"
}
