
export function getInfoPermissions(infos: any[]): any | object {
    let interfacePermissions = {
        isUserEdit: false,
        isUserDelete: false,
        isLeadEdit: false,
        isLeadDelete: false,
        isPermissionEdit: false,
        isPermissionDelete: false,
        isPermissionCreate: false,
        isConfigEdit: false,
        isCollaboratorCreate: false
    }
    infos.forEach((info) => {
        if(info.is_edit_user) {
            interfacePermissions.isUserEdit = true
        }
        if(info.is_delete_user) {
            interfacePermissions.isUserDelete = true
        }
        if(info.is_edit_lead) {
            interfacePermissions.isLeadEdit = true
        }
        if(info.is_delete_lead) {
            interfacePermissions.isLeadDelete = true
        }
        if(info.is_edit_permission) {
            interfacePermissions.isPermissionEdit = true
        }
        if(info.is_delete_permissions) {
            interfacePermissions.isPermissionDelete = true
        }
        if(info.is_create_permissions) {
            interfacePermissions.isPermissionCreate = true
        }
        if(info.is_edit_config) {
            interfacePermissions.isConfigEdit = true
        }
        if(info.is_create_collaborator) {
            interfacePermissions.isCollaboratorCreate = true
        }
    })
    return interfacePermissions
}
