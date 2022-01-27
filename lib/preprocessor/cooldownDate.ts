export class CooldownDate {
    private years = 0
    private months = 0
    private days = 0
    private hours = 0
    private minutes = 0
    private seconds = 0

    constructor(time: { years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number }) {
        this.years = time.years || 0
        this.months = time.months || 0
        this.days = time.days || 0
        this.hours = time.hours || 0
        this.minutes = time.minutes || 0
        this.seconds = time.seconds || 0
    }

    public setYears(years: number): CooldownDate {
        this.years = years || 0
        return this
    }

    public setMonths(months: number): CooldownDate {
        this.months = months || 0
        return this
    }

    public setDays(days: number): CooldownDate {
        this.days = days || 0
        return this
    }

    public setHours(hours: number): CooldownDate {
        this.hours = hours || 0
        return this
    }

    public setMinutes(minutes: number): CooldownDate {
        this.minutes = minutes || 0
        return this
    }

    public setSeconds(seconds: number): CooldownDate {
        this.seconds = seconds || 0
        return this
    }

    public getYears(): number {
        return this.years
    }

    public getMonths(): number {
        return this.months
    }

    public getDays(): number {
        return this.days
    }

    public getHours(): number {
        return this.hours
    }

    public getMinutes(): number {
        return this.minutes
    }

    public getSeconds(): number {
        return this.seconds
    }


    public getTotalSeconds(): number {
        return this.years * 31536000 + this.months * 2592000 + this.days * 86400 + this.hours * 3600 + this.minutes * 60 + this.seconds
    }
}