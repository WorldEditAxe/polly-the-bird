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

export type schema$dailyReport = {
    day: number, // unix seconds
    day_of_week: number,
    events_made: number
}

export type schema$weeklyReport = {
    sun: schema$dailyReport,
    mon: schema$dailyReport,
    tue: schema$dailyReport,
    wed: schema$dailyReport,
    thu: schema$dailyReport,
    fri: schema$dailyReport,
    sat: schema$dailyReport
}

export type schema$BaseManager = {
    user_id: string,
    current_weekly_report: schema$weeklyReport
    last_weekly_report: schema$weeklyReport
}

export const events = db.collection("event_managers")
export const giveaways = db.collection("giveaway_managers")
