import { Icons, MoonYearResetOptions } from "../../constants";
import { GameSettings } from "../foundry-interfacing/game-settings";
import ConfigurationItemBase from "../configuration/configuration-item-base";
import Calendar from "./index";

/**
 * Class for representing a moon
 */
export default class Moon extends ConfigurationItemBase {
    /**
     * How long in calendar days the moon takes to do 1 revolution
     * @type {number}
     */
    cycleLength: number;
    /**
     * The different phases of the moon
     * @type {Array<MoonPhase>}
     */
    phases: SimpleCalendar.MoonPhase[] = [];
    /**
     * When the first new moon took place. Used as a reference for calculating the position of the current cycle
     */
    firstNewMoon: SimpleCalendar.FirstNewMoonDate = {
        /**
         * The year reset options for the first new moon
         * @type {number}
         */
        yearReset: MoonYearResetOptions.None,
        /**
         * How often the year should reset
         * @type {number}
         */
        yearX: 0,
        /**
         * The year of the first new moon
         * @type {number}
         */
        year: 0,
        /**
         * The month of the first new moon
         * @type {number}
         */
        month: 1,
        /**
         * The day of the first new moon
         * @type {number}
         */
        day: 1
    };
    /**
     * A color to associate with the moon when displaying it on the calendar
     */
    color: string = "#ffffff";
    /**
     * The amount of days to adjust the current cycle day by
     * @type {number}
     */
    cycleDayAdjust: number = 0;

    /**
     * The moon constructor
     * @param {string} name The name of the moon
     * @param {number} cycleLength The length of the moons cycle
     */
    constructor(name: string = "", cycleLength: number = 0) {
        super(name);
        this.cycleLength = cycleLength;

        this.phases.push({
            name: GameSettings.Localize("FSC.Moon.Phase.New"),
            length: 3.69,
            icon: Icons.NewMoon,
            singleDay: true
        });
    }

    /**
     * Creates a clone of this moon object
     * @return {Moon}
     */
    clone(): Moon {
        const c = new Moon(this.name, this.cycleLength);
        c.id = this.id;
        c.phases = this.phases.map((p) => {
            return { name: p.name, length: p.length, icon: p.icon, singleDay: p.singleDay };
        });
        c.firstNewMoon.yearReset = this.firstNewMoon.yearReset;
        c.firstNewMoon.yearX = this.firstNewMoon.yearX;
        c.firstNewMoon.year = this.firstNewMoon.year;
        c.firstNewMoon.month = this.firstNewMoon.month;
        c.firstNewMoon.day = this.firstNewMoon.day;
        c.color = this.color;
        c.cycleDayAdjust = this.cycleDayAdjust;
        return c;
    }

    /**
     * Returns the configuration for the moon
     */
    toConfig(): SimpleCalendar.MoonData {
        return {
            id: this.id,
            name: this.name,
            cycleLength: this.cycleLength,
            firstNewMoon: {
                yearReset: this.firstNewMoon.yearReset,
                yearX: this.firstNewMoon.yearX,
                year: this.firstNewMoon.year,
                month: this.firstNewMoon.month,
                day: this.firstNewMoon.day
            },
            phases: this.phases.map((p) => {
                return { name: p.name, length: p.length, icon: p.icon, singleDay: p.singleDay };
            }),
            color: this.color,
            cycleDayAdjust: this.cycleDayAdjust
        };
    }

    /**
     * Converts this moon into a template used for displaying the moon in HTML
     */
    toTemplate(): SimpleCalendar.HandlebarTemplateData.Moon {
        const data: SimpleCalendar.HandlebarTemplateData.Moon = {
            ...super.toTemplate(),
            name: this.name,
            cycleLength: this.cycleLength,
            firstNewMoon: this.firstNewMoon,
            phases: this.phases,
            color: this.color,
            cycleDayAdjust: this.cycleDayAdjust,
            firstNewMoonDateSelectorId: `sc_first_new_moon_date_${this.id}`,
            firstNewMoonSelectedDate: { year: 0, month: this.firstNewMoon.month, day: this.firstNewMoon.day, hour: 0, minute: 0, seconds: 0 }
        };
        return data;
    }

    /**
     * Loads the moon data from the config object.
     * @param {MoonData} config The configuration object for this class
     */
    loadFromSettings(config: SimpleCalendar.MoonData) {
        if (config && Object.keys(config).length) {
            super.loadFromSettings(config);
            this.cycleLength = config.cycleLength;
            this.phases = config.phases;
            this.firstNewMoon = {
                yearReset: config.firstNewMoon.yearReset,
                yearX: config.firstNewMoon.yearX,
                year: config.firstNewMoon.year,
                month: config.firstNewMoon.month,
                day: config.firstNewMoon.day
            };
            this.color = config.color;
            this.cycleDayAdjust = config.cycleDayAdjust;
        }
    }

    /**
     * Updates each phases length in days so the total length of all phases matches the cycle length
     */
    updatePhaseLength() {
        let pLength = 0,
            singleDays = 0;
        for (let i = 0; i < this.phases.length; i++) {
            if (this.phases[i].singleDay) {
                singleDays++;
            } else {
                pLength++;
            }
        }
        const phaseLength = Number(((this.cycleLength - singleDays) / pLength).toPrecision(6));

        this.phases.forEach((p) => {
            if (p.singleDay) {
                p.length = 1;
            } else {
                p.length = phaseLength;
            }
        });
    }

    /**
     * Returns the current phase of the moon based on a year month and day.
     * This phase will be within + or - 1 days of when the phase actually begins
     * @param calendar The year class to get the information from
     * @param {number} yearNum The year to use
     * @param {number} monthIndex The month to use
     * @param {number} dayIndex The day to use
     */
    getDateMoonPhase(calendar: Calendar, yearNum: number, monthIndex: number, dayIndex: number): SimpleCalendar.MoonPhase {
        return this.phases[this.getPhaseIndex(this.getDateCycleDay(calendar, yearNum, monthIndex, dayIndex))];
    }

    /**
     * How many days into its cycle the moon is on a date, as the phase lookup sees it.
     * Includes cycleDayAdjust, so the value can run past cycleLength; the phase lookup treats that overflow as the first phase.
     * @param calendar The calendar the date is in
     * @param {number} yearNum The year to use
     * @param {number} monthIndex The month to use
     * @param {number} dayIndex The day to use
     */
    getDateCycleDay(calendar: Calendar, yearNum: number, monthIndex: number, dayIndex: number): number {
        let firstNewMoonDays = calendar.dateToDays(this.firstNewMoon.year, this.firstNewMoon.month, this.firstNewMoon.day, true);
        let resetYearAdjustment = 0;
        if (this.firstNewMoon.yearReset === MoonYearResetOptions.LeapYear) {
            const lyYear = calendar.year.leapYearRule.previousLeapYear(yearNum);
            if (lyYear !== null) {
                firstNewMoonDays = calendar.dateToDays(lyYear, this.firstNewMoon.month, this.firstNewMoon.day, true);
                if (yearNum !== lyYear) {
                    resetYearAdjustment += calendar.year.leapYearRule.fraction(yearNum);
                }
            }
        } else if (this.firstNewMoon.yearReset === MoonYearResetOptions.XYears) {
            const resetMod = yearNum % this.firstNewMoon.yearX;
            if (resetMod !== 0) {
                const resetYear = yearNum - resetMod;
                firstNewMoonDays = calendar.dateToDays(resetYear, this.firstNewMoon.month, this.firstNewMoon.day, true);
                resetYearAdjustment += resetMod / this.firstNewMoon.yearX;
            }
        }

        const daysSoFar = calendar.dateToDays(yearNum, monthIndex, dayIndex, true);
        const daysSinceReferenceMoon = daysSoFar - firstNewMoonDays + resetYearAdjustment;
        const moonCycles = daysSinceReferenceMoon / this.cycleLength;
        return (moonCycles - Math.floor(moonCycles)) * this.cycleLength + this.cycleDayAdjust;
    }

    /**
     * The index of the phase a cycle day falls in. Days outside every phase fall back to the first phase.
     * @param {number} daysIntoCycle Days into the cycle, as returned by getDateCycleDay
     */
    getPhaseIndex(daysIntoCycle: number): number {
        let phaseDays = 0;
        for (let i = 0; i < this.phases.length; i++) {
            const newPhaseDays = phaseDays + this.phases[i].length;
            if (daysIntoCycle >= phaseDays && daysIntoCycle < newPhaseDays) {
                return i;
            }
            phaseDays = newPhaseDays;
        }
        return 0;
    }

    /**
     * The moon's state at a moment in time.
     * The phase is the one the calendar shows for that date. The cycle position also counts the time of day, so it moves
     * smoothly through the day while the phase changes only at the date boundary.
     * @param calendar The calendar to read the date from
     * @param {number} seconds The timestamp to get the state for
     */
    getMoonState(calendar: Calendar, seconds: number, sunEvents?: number[]): SimpleCalendar.MoonState {
        const dt = calendar.secondsToDate(seconds);
        const cycleDay = this.getDateCycleDay(calendar, dt.year, dt.month, dt.day);
        const phaseIndex = this.getPhaseIndex(cycleDay);
        const phase = this.phases[phaseIndex];

        let daysIntoCycle = 0;
        if (this.cycleLength > 0) {
            const time = calendar.time;
            const dayFraction = ((dt.hour * time.minutesInHour + dt.minute) * time.secondsInMinute + dt.seconds) / time.secondsPerDay;
            daysIntoCycle = (((cycleDay + dayFraction) % this.cycleLength) + this.cycleLength) % this.cycleLength;
        }

        const phaseAngle = this.phaseAngleFor(daysIntoCycle);
        return {
            id: this.id,
            name: this.name,
            phase: phase ? { name: phase.name, length: phase.length, icon: phase.icon, singleDay: phase.singleDay } : phase,
            phaseIndex: phaseIndex,
            daysIntoCycle: daysIntoCycle,
            cycleFraction: this.cycleLength > 0 ? daysIntoCycle / this.cycleLength : 0,
            phaseAngle: phaseAngle,
            up: this.cycleLength > 0 && Moon.isUpAt(calendar.getSolarPosition(seconds, sunEvents), phaseAngle)
        };
    }

    /**
     * How far the moon is round from new, 0 to just under 1, with full at 0.5.
     * Measured from the centre of the first phase rather than its start: cycle day 0 is the start of the new moon's day, not
     * the moment of new moon, so centring puts full exactly halfway for any phase list laid out symmetrically.
     * @param {number} daysIntoCycle Days into the cycle, as getMoonState reports them
     */
    phaseAngleFor(daysIntoCycle: number): number {
        if (this.cycleLength <= 0) {
            return 0;
        }
        const origin = (this.phases[0]?.length ?? 0) / 2;
        const angle = (daysIntoCycle - origin) / this.cycleLength;
        return ((angle % 1) + 1) % 1;
    }

    /**
     * Whether a moon is up. The moon is treated as a second sun running behind the real one by its phase angle: up for the half
     * of its round that the sun spends up. A new moon rises and sets with the sun, a full moon rises at sunset and sets at sunrise.
     * @param solarPosition The sun's position, from Calendar#getSolarPosition
     * @param phaseAngle The moon's phase angle, from phaseAngleFor
     */
    static isUpAt(solarPosition: number, phaseAngle: number): boolean {
        const position = solarPosition - phaseAngle;
        return ((position % 1) + 1) % 1 < 0.5;
    }

    /**
     * Moonrise and moonset during the date containing a timestamp, as timestamps. Either is null on a date without one: the moon
     * rises later each day, so every so often a date has no rise, or no set.
     * Found by stepping through the date and narrowing each change down, so the times are the moments isUpAt changes answer.
     * @param calendar The calendar the date is in
     * @param {number} seconds Any timestamp within the date
     */
    getRiseSet(calendar: Calendar, seconds: number): { rise: number | null; set: number | null } {
        const result: { rise: number | null; set: number | null } = { rise: null, set: null };
        if (this.cycleLength <= 0) {
            return result;
        }
        const secondsPerDay = calendar.time.secondsPerDay;
        const dayStart = Math.floor(seconds / secondsPerDay) * secondsPerDay;
        const events = calendar.getSunEvents(dayStart + Math.floor(secondsPerDay / 2));

        // Within one date the cycle position advances linearly (getMoonState adds the fraction of the day), so the phase angle is
        // read once and extended, rather than re-deriving the date for every sample.
        const startAngle = this.getMoonState(calendar, dayStart, events).phaseAngle;
        const perSecond = 1 / (this.cycleLength * secondsPerDay);
        const upAt = (t: number) => Moon.isUpAt(calendar.getSolarPosition(t, events), startAngle + (t - dayStart) * perSecond);

        const steps = 144;
        const step = secondsPerDay / steps;
        let previous = upAt(dayStart);
        for (let i = 1; i <= steps; i++) {
            const t = dayStart + i * step;
            const current = i === steps ? upAt(t - 1) : upAt(t);
            if (current !== previous) {
                let low = t - step;
                let high = i === steps ? t - 1 : t;
                for (let n = 0; n < 24 && high - low > 1; n++) {
                    const mid = (low + high) / 2;
                    if (upAt(mid) === previous) {
                        low = mid;
                    } else {
                        high = mid;
                    }
                }
                const moment = Math.round(high);
                if (current && result.rise === null) {
                    result.rise = moment;
                } else if (!current && result.set === null) {
                    result.set = moment;
                }
                previous = current;
            }
        }
        return result;
    }

    /**
     * Gets the moon phase based on the current, selected or visible date
     * @param calendar The year class used to get the year, month and day to use
     * @param property Which property to use when getting the year, month and day. Can be current, selected or visible
     * @param dayToUse The day to use instead of the day associated with the property
     */
    getMoonPhase(calendar: Calendar, property: string = "current", dayToUse: number = 0): SimpleCalendar.MoonPhase {
        property = property.toLowerCase() as "current" | "selected" | "visible";
        const yearNum =
            property === "current"
                ? calendar.year.numericRepresentation
                : property === "selected"
                ? calendar.year.selectedYear
                : calendar.year.visibleYear;
        const monthIndex = calendar.getMonthIndex(property);
        if (monthIndex > -1) {
            const dayIndex = property !== "visible" ? calendar.months[monthIndex].getDayIndex(property) : dayToUse;
            return this.getDateMoonPhase(calendar, yearNum, monthIndex, dayIndex);
        }
        return this.phases[0];
    }
}
