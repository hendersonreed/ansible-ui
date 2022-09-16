import { Static, Type } from '@sinclair/typebox'
import { useHistory, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import { PageBody, PageHeader } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { FormPageSubmitHandler, PageForm } from '../../../common/FormPage'
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data'
import { RouteE } from '../../../route'
import { getControllerError } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { Team } from './Team'

export function EditTeam() {
    const { t } = useTranslation()
    const history = useHistory()

    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: team } = useSWR<Team>(Number.isInteger(id) ? `/api/v2/teams/${id.toString()}/` : undefined, requestGet, swrOptions)

    const EditTeamSchema = Type.Object({
        name: Type.String({
            title: t('Name'),
            placeholder: t('Enter the name'),
            minLength: 1,
            errorMessage: { minLength: t('Name is required') },
        }),
        description: Type.Optional(
            Type.String({
                title: t('Description'),
                placeholder: t('Enter the description'),
                variant: 'textarea',
            })
        ),
        organization: Type.Optional(Type.Number()),
        summary_fields: Type.Object({
            organization: Type.Object({
                name: Type.String({
                    title: t('Organization'),
                    placeholder: t('Enter the organization'),
                    minLength: 1,
                    errorMessage: { minLength: t('Organization is required') },
                    variant: 'select',
                }),
            }),
        }),
    })

    type CreateTeam = Static<typeof EditTeamSchema>

    const { cache } = useSWRConfig()

    const onSubmit: FormPageSubmitHandler<CreateTeam> = async (editedTeam, setError, setFieldError) => {
        try {
            const result = await requestGet<ItemsResponse<Organization>>(
                `/api/v2/organizations/?name=${editedTeam.summary_fields.organization.name}`
            )
            if (result.results.length === 0) {
                setFieldError('summary_fields.organization.name', { message: t('Organization not found') })
                return false
            }
            const organization = result.results[0]
            editedTeam.organization = organization.id
            let team: Team
            if (Number.isInteger(id)) {
                team = await requestPatch<Team>(`/api/v2/teams/${id}/`, editedTeam)
            } else {
                team = await requestPost<Team>('/api/v2/teams/', editedTeam)
            }
            ;(cache as unknown as { clear: () => void }).clear?.()
            history.push(RouteE.TeamDetails.replace(':id', team.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }
    const onCancel = () => history.goBack()

    if (Number.isInteger(id)) {
        if (!team) {
            return (
                <>
                    <PageHeader breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit Team') }]} />
                </>
            )
        } else {
            return (
                <>
                    <PageHeader title={t('Edit Team')} breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit Team') }]} />
                    <PageBody>
                        <PageForm
                            schema={EditTeamSchema}
                            submitText={t('Save')}
                            onSubmit={onSubmit}
                            cancelText={t('Cancel')}
                            onCancel={onCancel}
                            defaultValue={team}
                        />
                    </PageBody>
                </>
            )
        }
    } else {
        return (
            <>
                <PageHeader title={t('Create Team')} breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Create Team') }]} />
                <PageBody>
                    <PageForm
                        schema={EditTeamSchema}
                        submitText={t('Create')}
                        onSubmit={onSubmit}
                        cancelText={t('Cancel')}
                        onCancel={onCancel}
                    />
                </PageBody>
            </>
        )
    }
}
