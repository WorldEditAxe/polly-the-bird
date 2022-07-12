export class CooldownDate {
    constructor(time) {
        this.years = 0;
        this.months = 0;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.years = time.years || 0;
        this.months = time.months || 0;
        this.days = time.days || 0;
        this.hours = time.hours || 0;
        this.minutes = time.minutes || 0;
        this.seconds = time.seconds || 0;
    }
    setYears(years) {
        this.years = years || 0;
        return this;
    }
    setMonths(months) {
        this.months = months || 0;
        return this;
    }
    setDays(days) {
        this.days = days || 0;
        return this;
    }
    setHours(hours) {
        this.hours = hours || 0;
        return this;
    }
    setMinutes(minutes) {
        this.minutes = minutes || 0;
        return this;
    }
    setSeconds(seconds) {
        this.seconds = seconds || 0;
        return this;
    }
    getYears() {
        return this.years;
    }
    getMonths() {
        return this.months;
    }
    getDays() {
        return this.days;
    }
    getHours() {
        return this.hours;
    }
    getMinutes() {
        return this.minutes;
    }
    getSeconds() {
        return this.seconds;
    }
    getTotalSeconds() {
        return this.years * 31536000 + this.months * 2592000 + this.days * 86400 + this.hours * 3600 + this.minutes * 60 + this.seconds;
    }
}
//# sourceMappingURL=cooldownDate.js.map