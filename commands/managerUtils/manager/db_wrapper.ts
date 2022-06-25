import { User } from "discord.js";
import { awaitStart, getDb } from "../../database.js";

await awaitStart()

const db = await getDb("managers")

// constants
const MANAGER_REQUIREMENTS = {
    giveaways: 7,
    events: 5
}

export enum DayOfWeek {
    SUNDAY = 1,
    MONDAY = 2,
    TUESDAY = 3,
    WEDNESDAY = 4,
    THURSDAY = 5,
    FRIDAY = 6,
    SATURDAY = 7
}

export function dayToString(date: number): string {
    if (date > 7 || date < 1) throw new Error("Date number is out of bounds!")

    switch(date) {
        case 1:
            return "Sunday"
            break
        case 2:
            return "Monday"
            break
        case 3:
            return "Tuesday"
            break
        case 4:
            return "Wednesday"
            break
        case 5:
            return "Thursday"
            break
        case 6:
            return "Friday"
            break
        case 7:
            return "Saturday"
            break
    }
}

export function dayToSchemaEnt(date: number): string {
    if (date > 7 || date < 1) throw new Error("Date number is out of bounds!")

    switch(date) {
        case 1:
            return 'sun'
            break
        case 2:
            return 'mon'
            break
        case 3:
            return 'tues'
            break
        case 4:
            return 'wed'
            break
        case 5:
            return 'thu'
            break
        case 6:
            return 'fri'
            break
        case 7:
            return 'sat'
            break
    }
}

export type schema$dailyReport = {
    day: number, // unix seconds
    day_of_week: number,
    quota_filled: number
}

export type schema$weeklyReport = {
    sun?: schema$dailyReport
    mon?: schema$dailyReport
    tue?: schema$dailyReport
    wed?: schema$dailyReport
    thu?: schema$dailyReport
    fri?: schema$dailyReport
    sat?: schema$dailyReport
}

export enum ManagerType {
    EVENTS = 'EVENTS',
    GIVEAWAYS = 'GIVEAWAYS'
}

export type ManagerReport = {
    user_id: string
    type: ManagerType
    eligibleStatus: boolean
    currentWeekReport: schema$weeklyReport
}

// last 2 reports are to be shown
export type schema$BaseManager = {
    user_id: string
    type: ManagerType
    on_break: number // unix time
    current_weekly_report: schema$weeklyReport
    last_weekly_report: schema$weeklyReport
    reports: []
}

export type schema$WeeklyStats = {
    week_of: number // UNIX time
    managers_gained: number
    managers_lost: number
    managers_filled: number
    managers_falling_behind: number
}

export const events = db.collection("event_managers")
export const giveaways = db.collection("giveaway_managers")

function getDaysBeforeToday(unix: number, days: number): number {
    const SINGLE_DAY = 86400
    return unix - (SINGLE_DAY * days)
}

function getDayOfCurrentWeek(day: DayOfWeek): number {
    const d = new Date()
    
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
    
    if (d.getDay() == day) { /* do nothing */ }
    else if (d.getDay() > day) d.setDate(d.getDate() - (d.getDay() - day))
    else d.setDate(d.getDate() - (day - d.getDay()))

    return Math.floor(d.getTime() / 1000)
}

function genBaseManagerSchema(userId: string, type: ManagerType): schema$BaseManager {
    return {
        user_id: userId,
        type: type,
        current_weekly_report: {
            sun: {
                day: getDayOfCurrentWeek(DayOfWeek.SUNDAY),
                day_of_week: 1,
                quota_filled: 0
            },
            mon: {
                day: getDayOfCurrentWeek(DayOfWeek.MONDAY),
                day_of_week: 2,
                quota_filled: 0
            },
            tue: {
                day: getDayOfCurrentWeek(DayOfWeek.TUESDAY),
                day_of_week: 3,
                quota_filled: 0
            },
            wed: {
                day: getDayOfCurrentWeek(DayOfWeek.WEDNESDAY),
                day_of_week: 4,
                quota_filled: 0
            },
            thu: {
                day: getDayOfCurrentWeek(DayOfWeek.THURSDAY),
                day_of_week: 5,
                quota_filled: 0
            },
            fri: {
                day: getDayOfCurrentWeek(DayOfWeek.FRIDAY),
                day_of_week: 6,
                quota_filled: 0
            },
            sat: {
                day: getDayOfCurrentWeek(DayOfWeek.SATURDAY),
                day_of_week: 7,
                quota_filled: 0
            }
        },
        last_weekly_report: null,
        reports: []
    }
}

export async function initManager(user: User, type: ManagerType) {
    await events.insertOne(genBaseManagerSchema(user.id, type) as schema$BaseManager)
}

export async function setManagerDayQuota(user: User, type: ManagerType, filledCount: number, options?: { day?: DayOfWeek, action?: 'INC' | 'DEC' | 'SET' }) {
    const day: DayOfWeek = options ? options.day || new Date().getDay() : new Date().getDay()
    const act = options ? options.action || 'SET' : 'SET'

    switch(act) {
        case 'SET':
            if (type == ManagerType.EVENTS) {
                await events.updateOne({ user_id: user.id }, {
                    $set: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: filledCount
                    }
                })
            } else {
                await giveaways.updateOne({ user_id: user.id }, {
                    $set: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: filledCount
                    }
                })
            }
            break
        case 'INC':
            if (type == ManagerType.EVENTS) {
                await events.updateOne({ user_id: user.id }, {
                    $inc: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: filledCount
                    }
                })
            } else {
                await giveaways.updateOne({ user_id: user.id }, {
                    $inc: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: filledCount
                    }
                })
            }
            break
        case 'DEC':
            if (type == ManagerType.EVENTS) {
                await events.updateOne({ user_id: user.id }, {
                    $inc: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: -filledCount
                    }
                })
            } else {
                await giveaways.updateOne({ user_id: user.id }, {
                    $inc: {
                        [`current_weekly_report.${dayToSchemaEnt(day)}`]: -filledCount
                    }
                })
            }
            break
    }
}

export async function isUserManager(user: User): Promise<boolean> {
    return !!(await events.findOne({ user_id: user.id })) || !!(await giveaways.findOne({ user_id: user.id }))
}

export function generateReport(manager: schema$BaseManager): ManagerReport {
    const ret: ManagerReport = {
        user_id: manager.user_id,
        type: manager.type,
        eligibleStatus: undefined,
        currentWeekReport: manager.current_weekly_report
    }
    const req = manager.type == ManagerType.EVENTS ? MANAGER_REQUIREMENTS.events : MANAGER_REQUIREMENTS.giveaways
    let totalQuotaFilled: number = 0
    Object.values(manager.current_weekly_report).forEach(dailyReport => totalQuotaFilled += dailyReport.quota_filled)

    if (totalQuotaFilled >= totalQuotaFilled) ret.eligibleStatus = true
    else ret.eligibleStatus = false

    return ret
}