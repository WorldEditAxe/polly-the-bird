import { User } from "discord.js";
import { awaitStart, getDb } from "../../database.js";

await awaitStart()

const db = await getDb("managers")

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

export function dayToEnum(date: number): DayOfWeek {
    if (date > 7 || date < 1) throw new Error("Date number is out of bounds!")

    switch(date) {
        case 1:
            return DayOfWeek.SATURDAY
            break
        case 2:
            return DayOfWeek.MONDAY
            break
        case 3:
            return DayOfWeek.TUESDAY
            break
        case 4:
            return DayOfWeek.WEDNESDAY
            break
        case 5:
            return DayOfWeek.THURSDAY
            break
        case 6:
            return DayOfWeek.FRIDAY
            break
        case 7:
            return DayOfWeek.SATURDAY
            break
    }
}

export type schema$dailyReport = {
    day: number, // unix seconds
    day_of_week: number,
    quota_filled: number
}

export type schema$weeklyReport = {
    sun?: schema$dailyReport,
    mon?: schema$dailyReport,
    tue?: schema$dailyReport,
    wed?: schema$dailyReport,
    thu?: schema$dailyReport,
    fri?: schema$dailyReport,
    sat?: schema$dailyReport
}

export type schema$BaseManager = {
    user_id: string,
    current_weekly_report: schema$weeklyReport
    last_weekly_report: schema$weeklyReport
}

export const events = db.collection("event_managers")
export const giveaways = db.collection("giveaway_managers")

function getDaysBeforeToday(unix: number, days: number): number {
    const SINGLE_DAY = 86400
    return unix - (SINGLE_DAY * days)
}

function getUnixSeconds(): number {
    return Math.floor(Date.now() / 1000)
}

function getCurrentDayOfWeek(): number {
    return new Date().getDay()
}

export async function initManager(user: User, type: 'EVENTS' | 'GIVEAWAYS') {
    if (type == 'EVENTS') {
        let ins: schema$BaseManager = {
            user_id: user.id,
            current_weekly_report: {
                sun: {
                    day: getDaysBeforeToday(getUnixSeconds(), getCurrentDayOfWeek),
                    day_of_week: 0,
                    quota_filled: 0
                },
                mon: {
                    day: 2,
                    day_of_week: 0,
                    quota_filled: 0
                },
                tue: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                wed: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                thu: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                fri: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                sat: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                }
            },
            last_weekly_report: {
                sun: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                mon: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                tue: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                wed: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                thu: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                fri: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                },
                sat: {
                    day: 0,
                    day_of_week: 0,
                    quota_filled: 0
                }
            }
        }

        
    } else if (type == 'GIVEAWAYS') {

    }
}