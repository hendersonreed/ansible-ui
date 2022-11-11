/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type CredentialType = {
  id: number
  type: string
  url: string
  related: {
    credentials: string
    activity_stream: string
  }
  summary_fields: {
    user_capabilities: {
      edit: boolean
      delete: boolean
    }
  }
  created: string
  modified: string
  name: string
  description: string
  kind: string
  namespace: string
  managed: boolean
  inputs: {
    fields: {
      id: string
      label: string
      type?: string
      secret?: boolean
      help_text?: string
      format?: string
      multiline?: boolean
      default?: boolean | string
      choices?: string[]
      ask_at_runtime?: boolean
    }[]
    required?: string[]
    metadata?: {
      id: string
      label: string
      type: string
      help_text?: string
      default?: string
      choices?: string[]
      multiline?: boolean
    }[]
    dependencies?: {
      authorize_password: string[]
    }
  }
  injectors: {
    env?: {
      TOWER_HOST?: string
      TOWER_USERNAME?: string
      TOWER_PASSWORD?: string
      TOWER_VERIFY_SSL?: string
      TOWER_OAUTH_TOKEN?: string
      CONTROLLER_HOST?: string
      CONTROLLER_USERNAME?: string
      CONTROLLER_PASSWORD?: string
      CONTROLLER_VERIFY_SSL?: string
      CONTROLLER_OAUTH_TOKEN?: string
      OVIRT_INI_PATH?: string
      OVIRT_URL?: string
      OVIRT_USERNAME?: string
      OVIRT_PASSWORD?: string
      INSIGHTS_USER?: string
      INSIGHTS_PASSWORD?: string
    }
    file?: {
      template: string
    }
    extra_vars?: {
      scm_username: string
      scm_password: string
    }
  }
}[]