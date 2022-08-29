import { Chart, ChartArea, ChartAxis, ChartDonut, ChartStack } from '@patternfly/react-charts'
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Flex,
    FlexItem,
    Gallery,
    PageSection,
    Skeleton,
    Split,
    SplitItem,
    Stack,
} from '@patternfly/react-core'
import useResizeObserver from '@react-hook/resize-observer'
import { DateTime } from 'luxon'
import { Fragment, Suspense, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { getPatternflyColor, PageHeader, PatternFlyColor } from '../../../../framework'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { RouteE } from '../../../route'
import { useHosts } from '../../resources/Hosts'
import { useInventories } from '../../resources/Inventories'
import { useProjects } from '../../resources/Projects'
import { useJobs } from '../Jobs'

export default function Dashboard() {
    return (
        <Fragment>
            {/* <Banner variant="info">You are</Banner> */}
            <PageHeader
                title="Ansible Automation Platform"
                description="An enterprise automation platform for the entire IT organization, no matter where you are in your automation journey."
            />
            <Scrollable>
                <PageSection>
                    <Stack hasGutter>
                        <Gallery hasGutter minWidths={{ default: '275px' }}>
                            <HostsCard />
                            <InventoriesCard />
                            <ProjectsCard />
                        </Gallery>
                        <JobsCard />
                    </Stack>
                </PageSection>
            </Scrollable>
        </Fragment>
    )
}

function HostsCard() {
    return (
        <Suspense fallback={<SkeletonDonutCard title="Hosts" to={RouteE.Hosts} count={2} />}>
            <HostsCardContent />
        </Suspense>
    )
}
function HostsCardContent() {
    const hosts = useHosts()
    const successfulHosts = useMemo(() => hosts.filter((host) => !host.has_active_failures), [hosts])
    const failureHosts = useMemo(() => hosts.filter((host) => host.has_active_failures), [hosts])
    return (
        <DashboardDonutCard
            title="Hosts"
            to={RouteE.Hosts}
            items={[
                {
                    label: 'Ready',
                    count: successfulHosts.length,
                    color: getPatternflyColor(PatternFlyColor.Green) ?? 'black',
                },
                {
                    label: 'Failures',
                    count: failureHosts.length,
                    color: getPatternflyColor(PatternFlyColor.Red) ?? 'black',
                },
            ]}
        />
    )
}

function InventoriesCard() {
    return (
        <Suspense fallback={<SkeletonDonutCard title="Inventories" to={RouteE.Inventories} count={2} />}>
            <InventoriesCardContent />
        </Suspense>
    )
}
function InventoriesCardContent() {
    const inventories = useInventories()
    const successfulInventories = useMemo(
        () => inventories.filter((inventory) => inventory.inventory_sources_with_failures === 0),
        [inventories]
    )
    const failureInventories = useMemo(
        () => inventories.filter((inventory) => inventory.inventory_sources_with_failures !== 0),
        [inventories]
    )
    return (
        <DashboardDonutCard
            title="Inventories"
            to={RouteE.Inventories}
            items={[
                {
                    label: 'Ready',
                    count: successfulInventories.length,
                    color: getPatternflyColor(PatternFlyColor.Green) ?? 'black',
                },
                {
                    label: 'Failures',
                    count: failureInventories.length,
                    color: getPatternflyColor(PatternFlyColor.Red) ?? 'black',
                },
            ]}
        />
    )
}

function ProjectsCard() {
    return (
        <Suspense fallback={<SkeletonDonutCard title="Projects" to={RouteE.Inventories} count={2} />}>
            <ProjectsCardContent />
        </Suspense>
    )
}
function ProjectsCardContent() {
    const projects = useProjects()
    const successfulProjects = useMemo(() => projects.filter((project) => project.status === 'successful'), [projects])
    const failureProjects = useMemo(() => projects.filter((project) => project.status !== 'successful'), [projects])
    return (
        <DashboardDonutCard
            title="Projects"
            to={RouteE.Projects}
            items={[
                {
                    label: 'Ready',
                    count: successfulProjects.length,
                    color: getPatternflyColor(PatternFlyColor.Green) ?? 'black',
                },
                {
                    label: 'Failures',
                    count: failureProjects.length,
                    color: getPatternflyColor(PatternFlyColor.Red) ?? 'black',
                },
            ]}
        />
    )
}

function JobsCard() {
    return (
        <Suspense fallback={<JobsCardSkeleton />}>
            <JobsCardContent />
        </Suspense>
    )
}
function JobsCardSkeleton() {
    return (
        <Stack hasGutter>
            <Card isFlat isSelectable isRounded>
                <CardHeader>
                    <CardTitle>Job Runs</CardTitle>
                </CardHeader>
                <CardBody>
                    <Skeleton height="206px" style={{ marginLeft: 24, marginTop: 6, marginBottom: 32, marginRight: 8 }} />
                </CardBody>
            </Card>
            {/* <Card isFlat isRounded>
                <Tabs style={{ paddingTop: 8 }}>
                    <Tab title="Recent jobs" eventKey={0}></Tab>
                    <Tab title="Recent templates" eventKey={2}></Tab>
                </Tabs>
                <div>
                    <div style={{ maxHeight: 600, height: 600 }}>
                        <LoadingTable toolbar />
                    </div>
                </div>
            </Card> */}
        </Stack>
    )
}
function JobsCardContent() {
    const jobs = useJobs()
    const jobHistory = useMemo(() => {
        const success: Record<string, number> = {}
        const failure: Record<string, number> = {}
        const now = DateTime.now()
        const monthAgo = now.minus({ months: 1 })

        for (let iterator = now.minus({ months: 1 }); iterator < now; iterator = iterator.plus({ day: 1 })) {
            const label = iterator.month.toString().padStart(2, ' ') + '/' + iterator.day.toString().padStart(2, ' ')
            if (!success[label]) success[label] = 0
            if (!failure[label]) failure[label] = 0
        }

        for (const job of jobs) {
            const dateTime = DateTime.fromISO(job.finished)
            if (dateTime < monthAgo) continue
            const date = DateTime.fromISO(job.finished)
            const label = date.month.toString().padStart(2, ' ') + '/' + date.day.toString().padStart(2, ' ')
            if (!success[label]) success[label] = 0
            if (!failure[label]) failure[label] = 0
            if (!job.failed) {
                success[label]++
            } else {
                failure[label]++
            }
        }
        return {
            successful: Object.keys(success)
                .sort()
                .map((label) => ({ label: label.replace(' ', '').replace(' ', ''), value: success[label] })),
            failed: Object.keys(failure)
                .sort()
                .map((label) => ({ label: label.replace(' ', '').replace(' ', ''), value: failure[label] })),
        }
    }, [jobs])
    return (
        <Fragment>
            <Card isFlat isSelectable isRounded>
                <CardHeader>
                    <CardTitle>Job Runs</CardTitle>
                </CardHeader>
                <div style={{ marginTop: -16, marginBottom: -15 }}>
                    <DashboardChart
                        groups={[
                            {
                                color: getPatternflyColor(PatternFlyColor.Red) ?? 'black',
                                values: jobHistory.failed,
                            },
                            {
                                color: getPatternflyColor(PatternFlyColor.Green) ?? 'black',
                                values: jobHistory.successful,
                            },
                        ]}
                    />
                </div>
            </Card>
            {/* <Card isFlat isRounded>
                <Tabs style={{ paddingTop: 8 }}>
                    <Tab title="Recent jobs" eventKey={0}></Tab>
                    <Tab title="Recent templates" eventKey={2}></Tab>
                </Tabs>
                <div>
                    <div style={{ maxHeight: 600, height: 600 }}>
                        <JobsTable jobs={jobs} />
                    </div>
                </div>
            </Card> */}
        </Fragment>
    )
}

function SkeletonDonutCard(props: { title: string; count: number; to: string }) {
    const { title, count, to } = props
    return (
        <Card isFlat isSelectable isRounded style={{ transition: 'box-shadow 0.25s' }} onClick={() => history.push(to)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardBody>
                <Split hasGutter>
                    <SplitItem>
                        <Skeleton shape="circle" width="100px" />
                    </SplitItem>
                    <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                            {new Array(count).fill(0).map((_, index) => (
                                <FlexItem key={index}>
                                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                        <FlexItem>
                                            <div style={{ width: 12, height: 12 }}>
                                                <Skeleton shape="square" width="12" height="12" />
                                            </div>
                                        </FlexItem>
                                        <FlexItem grow={{ default: 'grow' }}>
                                            <Skeleton shape="square" width="70px" height="14px" />
                                        </FlexItem>
                                    </Flex>
                                </FlexItem>
                            ))}
                        </Flex>
                    </SplitItem>
                </Split>
            </CardBody>
        </Card>
    )
}

function DashboardDonutCard(props: {
    title: string
    to: string
    items: { count: number; label: string; color: string }[]
    loading?: boolean
}) {
    const { title, items, loading } = props
    const total = items.reduce((total, item) => total + item.count, 0)
    const history = useHistory()
    return (
        <Card isFlat isSelectable isRounded style={{ transition: 'box-shadow 0.25s' }} onClick={() => history.push(props.to)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardBody>
                {loading === true ? (
                    <Split hasGutter>
                        <SplitItem>
                            <Skeleton shape="circle" width="100px" />
                        </SplitItem>
                        <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                {items.map((item) => (
                                    <FlexItem key={item.label}>
                                        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                            <FlexItem>
                                                <div style={{ width: 12, height: 12 }}>
                                                    <Skeleton shape="square" width="12" height="12" />
                                                </div>
                                            </FlexItem>
                                            <FlexItem grow={{ default: 'grow' }}>
                                                <Skeleton shape="square" width="70px" height="14px" />
                                            </FlexItem>
                                        </Flex>
                                    </FlexItem>
                                ))}
                            </Flex>
                        </SplitItem>
                    </Split>
                ) : (
                    <Split hasGutter>
                        <SplitItem>
                            <div style={{ width: '100px', height: '100px' }}>
                                <ChartDonut
                                    ariaDesc="Average number of pets"
                                    ariaTitle="Donut chart example"
                                    constrainToVisibleArea
                                    data={items.map((item) => ({ x: item.label, y: item.count }))}
                                    title={total.toString()}
                                    colorScale={items.map((item) => item.color)}
                                    padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
                                    width={100}
                                    height={100}
                                />
                            </div>
                        </SplitItem>
                        <SplitItem style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                {items.map((item) => {
                                    if (item.count === 0) return <Fragment key={item.label}></Fragment>
                                    return (
                                        <FlexItem key={item.label}>
                                            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                                <FlexItem>
                                                    <div style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 2 }} />
                                                </FlexItem>
                                                <FlexItem style={{ paddingLeft: 4, paddingRight: 2, textAlign: 'right', minWidth: 16 }}>
                                                    {item.count}
                                                </FlexItem>
                                                <FlexItem>{item.label}</FlexItem>
                                            </Flex>
                                        </FlexItem>
                                    )
                                })}
                            </Flex>
                        </SplitItem>
                    </Split>
                )}
            </CardBody>
        </Card>
    )
}

function DashboardChart(props: {
    groups: {
        color: string
        values: {
            label: string
            value: number
        }[]
    }[]
}) {
    let { groups } = props

    groups = groups.filter((group) => {
        for (const value of group.values) {
            if (value.value !== 0) return true
        }
        return false
    })

    const sizeRef = useRef<HTMLDivElement>(null)

    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const resize = useCallback(() => setSize({ width: sizeRef.current?.clientWidth ?? 0, height: sizeRef.current?.clientHeight ?? 0 }), [])
    useResizeObserver(sizeRef, () => {
        resize()
    })
    useLayoutEffect(() => resize(), [resize])

    const height = 300

    return (
        <div ref={sizeRef} style={{ height: `${height}px` }}>
            <Chart
                ariaDesc="Average number of pets"
                ariaTitle="Area chart example"
                // containerComponent={
                //     <CursorVoronoiContainer
                //         cursorDimension="x"
                //         labels={({ datum }) => `${datum.y !== null ? datum.y : 'no data'}`}
                //         labelComponent={<ChartLegendTooltip legendData={legendData} title={(datum) => datum.x} />}
                //         mouseFollowTooltips
                //         voronoiDimension="x"
                //         voronoiPadding={50}
                //     />
                // }
                // legendData={legendData}
                // legendPosition="bottom-left"
                height={size.height}
                padding={{
                    bottom: 75, // Adjusted to accomodate legend
                    left: 50,
                    right: 30,
                    top: 25,
                }}
                // maxDomain={{ y: 25 }}
                colorScale={groups.map((group) => group.color)}
                // themeColor={ChartThemeColor.multiUnordered}
                // width={width}
                width={size.width}
            >
                <ChartAxis />
                <ChartAxis dependentAxis showGrid />
                <ChartStack>
                    {groups.map((group, index) => (
                        <ChartArea
                            key={index}
                            data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                            interpolation="monotoneX"
                            // name="cats"
                        />
                    ))}
                    {/* <ChartArea
                        data={[
                            { x: 'Sunday', y: 6 },
                            { x: 'Monday', y: 2 },
                            { x: 'Tuesday', y: 8 },
                            { x: 'Wednesday', y: 5 },
                            { x: 'Thursday', y: 6 },
                            { x: 'Friday', y: 2 },
                            { x: 'Saturday', y: 0 },
                        ]}
                        interpolation="monotoneX"
                        name="cats"
                    />
                    <ChartArea
                        data={[
                            { x: 'Sunday', y: 4 },
                            { x: 'Monday', y: 5 },
                            { x: 'Tuesday', y: 7 },
                            { x: 'Wednesday', y: 6 },
                            { x: 'Thursday', y: 10 },
                            { x: 'Friday', y: 3 },
                            { x: 'Saturday', y: 5 },
                        ]}
                        interpolation="monotoneX"
                        name="dogs"
                    /> */}
                </ChartStack>
            </Chart>
        </div>
    )
}