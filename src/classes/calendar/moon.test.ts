/**
 * @jest-environment jsdom
 */
import "../../../__mocks__/index";
import { jest, beforeEach, describe, expect, test } from "@jest/globals";
import Moon from "./moon";
import { Icons, MoonYearResetOptions, PredefinedCalendars } from "../../constants";
import { CalManager, updateCalManager, updateNManager } from "../index";
import CalendarManager from "./calendar-manager";
import Calendar from "./index";
import PredefinedCalendar from "../configuration/predefined-calendar";
import fetchMock from "jest-fetch-mock";
import NoteManager from "../notes/note-manager";
import { DateToTimestamp } from "../utilities/date-time";

fetchMock.enableMocks();
describe("Moon Tests", () => {
    let m: Moon;
    let tCal: Calendar;

    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(
            `{"calendar":{"currentDate":{"year":2022,"month":2,"day":28,"seconds":127},"general":{"gameWorldTimeIntegration":"mixed","showClock":true,"noteDefaultVisibility":false,"postNoteRemindersOnFoundryLoad":true,"pf2eSync":true,"dateFormat":{"date":"MMMM DD, YYYY","time":"HH:mm:ss","monthYear":"MMMM YAYYYYYZ"}},"leapYear":{"rule":"gregorian","customMod":0},"months":[{"name":"January","abbreviation":"Jan","numericRepresentation":1,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"February","abbreviation":"Feb","numericRepresentation":2,"numericRepresentationOffset":0,"numberOfDays":28,"numberOfLeapYearDays":29,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"March","abbreviation":"Mar","numericRepresentation":3,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"April","abbreviation":"Apr","numericRepresentation":4,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"May","abbreviation":"May","numericRepresentation":5,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"June","abbreviation":"Jun","numericRepresentation":6,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"July","abbreviation":"Jul","numericRepresentation":7,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"August","abbreviation":"Aug","numericRepresentation":8,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"September","abbreviation":"Sep","numericRepresentation":9,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"October","abbreviation":"Oct","numericRepresentation":10,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"November","abbreviation":"Nov","numericRepresentation":11,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"December","abbreviation":"Dec","numericRepresentation":12,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null}],"moons":[{"name":"Moon","cycleLength":29.53059,"firstNewMoon":{"yearReset":"none","yearX":0,"year":2000,"month":1,"day":5},"phases":[{"name":"New Moon","length":1,"icon":"new","singleDay":true},{"name":"Waxing Crescent","length":6.38265,"icon":"waxing-crescent","singleDay":false},{"name":"First Quarter","length":1,"icon":"first-quarter","singleDay":true},{"name":"Waxing Gibbous","length":6.38265,"icon":"waxing-gibbous","singleDay":false},{"name":"Full Moon","length":1,"icon":"full","singleDay":true},{"name":"Waning Gibbous","length":6.38265,"icon":"waning-gibbous","singleDay":false},{"name":"Last Quarter","length":1,"icon":"last-quarter","singleDay":true},{"name":"Waning Crescent","length":6.38265,"icon":"waning-crescent","singleDay":false}],"color":"#ffffff","cycleDayAdjust":0.5}],"noteCategories":[{"name":"Holiday","textColor":"#FFFFFF","color":"#148e94"}],"seasons":[{"name":"Spring","startingMonth":2,"startingDay":19,"color":"#46b946","icon":"spring","sunriseTime":21600,"sunsetTime":64800},{"name":"Summer","startingMonth":5,"startingDay":19,"color":"#e0c40b","icon":"summer","sunriseTime":21600,"sunsetTime":64800},{"name":"Fall","startingMonth":8,"startingDay":21,"color":"#ff8e47","icon":"fall","sunriseTime":21600,"sunsetTime":64800},{"name":"Winter","startingMonth":11,"startingDay":20,"color":"#479dff","icon":"winter","sunriseTime":21600,"sunsetTime":64800}],"time":{"hoursInDay":24,"minutesInHour":60,"secondsInMinute":60,"gameTimeRatio":1,"unifyGameAndClockPause":false,"updateFrequency":1},"weekdays":[{"abbreviation":"Su","name":"Sunday","numericRepresentation":1},{"abbreviation":"Mo","name":"Monday","numericRepresentation":2},{"abbreviation":"Tu","name":"Tuesday","numericRepresentation":3},{"abbreviation":"We","name":"Wednesday","numericRepresentation":4},{"abbreviation":"Th","name":"Thursday","numericRepresentation":5},{"abbreviation":"Fr","name":"Friday","numericRepresentation":6},{"abbreviation":"Sa","name":"Saturday","numericRepresentation":7}],"year":{"numericRepresentation":2022,"prefix":"","postfix":"","showWeekdayHeadings":true,"firstWeekday":4,"yearZero":1970,"yearNames":[],"yearNamingRule":"default","yearNamesStart":0}}}`
        );
        updateCalManager(new CalendarManager());
        updateNManager(new NoteManager());
        tCal = new Calendar("", "");
        jest.spyOn(CalManager, "getActiveCalendar").mockImplementation(() => {
            return tCal;
        });
        await PredefinedCalendar.setToPredefined(tCal, PredefinedCalendars.Gregorian);
        m = tCal.moons[0];
    });

    test("Properties", () => {
        expect(Object.keys(m).length).toBe(11); //Make sure no new properties have been added
        expect(m.name).toBe("Moon");
        expect(m.cycleLength).toBe(29.53059);
        expect(m.cycleDayAdjust).toBe(0.5);
        expect(m.color).toBe("#ffffff");
        expect(m.phases.length).toBe(8);
        expect(m.firstNewMoon).toStrictEqual({ day: 5, month: 1, year: 2000, yearReset: "none", yearX: 0 });
    });

    test("Clone", () => {
        expect(m.clone()).toStrictEqual(m);
    });

    test("To Config", () => {
        let c = m.toConfig();
        expect(Object.keys(c).length).toBe(7); //Make sure no new properties have been added
        expect(c.name).toBe("Moon");
        expect(c.cycleLength).toBe(29.53059);
    });

    test("To Template", () => {
        let c = m.toTemplate();
        expect(Object.keys(c).length).toBe(13); //Make sure no new properties have been added
        expect(c.name).toBe("Moon");
        expect(c.cycleLength).toBe(29.53059);
        expect(c.firstNewMoon).toStrictEqual({ day: 5, month: 1, year: 2000, yearReset: "none", yearX: 0 });
        expect(c.phases.length).toBe(8);
        expect(c.color).toBe("#ffffff");
        expect(c.cycleDayAdjust).toBe(0.5);
    });

    test("Load From Settings", () => {
        //@ts-ignore
        m.loadFromSettings({});
        expect(m.id).toBeDefined();
        //@ts-ignore
        m.loadFromSettings({ id: "a", name: "", firstNewMoon: {} });
        expect(m.id).toBe("a");
        //@ts-ignore
        m.loadFromSettings({ name: "", firstNewMoon: {} });
        expect(m.id).toBeDefined();
    });

    test("Update Phase Length", () => {
        m.updatePhaseLength();
        expect(m.phases[0].length).toBe(1);

        m.phases.push({ name: "p2", icon: Icons.NewMoon, length: 0, singleDay: false });
        m.updatePhaseLength();
        expect(m.phases[0].length).toBe(1);
        expect(m.phases[1].length).toBe(5.10612);
    });

    test("Get Date Moon Phase", () => {
        expect(m.getDateMoonPhase(tCal, 1999, 11, 24)).toStrictEqual(m.phases[5]);
        expect(m.getDateMoonPhase(tCal, 2000, 0, 6)).toStrictEqual(m.phases[0]);

        m.firstNewMoon.yearReset = MoonYearResetOptions.LeapYear;
        expect(m.getDateMoonPhase(tCal, 1999, 11, 24)).toStrictEqual(m.phases[1]);

        m.firstNewMoon.yearReset = MoonYearResetOptions.XYears;
        expect(m.getDateMoonPhase(tCal, 1999, 11, 24)).toStrictEqual(m.phases[0]);
        m.firstNewMoon.yearX = 5;
        expect(m.getDateMoonPhase(tCal, 1999, 11, 24)).toStrictEqual(m.phases[3]);
    });

    test("Get Date Cycle Day and Phase Index", () => {
        const cycleDay = m.getDateCycleDay(tCal, 1999, 11, 24);
        expect(cycleDay).toBeGreaterThanOrEqual(0);
        expect(m.phases[m.getPhaseIndex(cycleDay)]).toStrictEqual(m.getDateMoonPhase(tCal, 1999, 11, 24));

        expect(m.getPhaseIndex(0)).toBe(0);
        expect(m.getPhaseIndex(1)).toBe(1);
        expect(m.getPhaseIndex(7.5)).toBe(2);
        expect(m.getPhaseIndex(m.cycleLength + 0.1)).toBe(0);
    });

    test("Get Moon State", () => {
        const dayStart = DateToTimestamp({ year: 2000, month: 0, day: 20, hour: 0, minute: 0, seconds: 0 }, tCal);
        const midday = dayStart + tCal.time.secondsPerDay / 2;

        const a = m.getMoonState(tCal, dayStart);
        const b = m.getMoonState(tCal, midday);
        expect(a.id).toBe(m.id);
        expect(a.name).toBe("Moon");
        expect(a.phase).toStrictEqual(m.getDateMoonPhase(tCal, 2000, 0, 20));
        expect(a.phaseIndex).toBe(m.getPhaseIndex(m.getDateCycleDay(tCal, 2000, 0, 20)));
        expect(a.cycleFraction).toBeCloseTo(a.daysIntoCycle / m.cycleLength);

        // The phase holds for the whole date; the cycle position moves with the time of day
        expect(b.phaseIndex).toBe(a.phaseIndex);
        expect(b.daysIntoCycle - a.daysIntoCycle).toBeCloseTo(0.5);

        // Wraps into the cycle rather than running past its length
        m.cycleDayAdjust = m.cycleLength;
        const c = m.getMoonState(tCal, dayStart);
        expect(c.daysIntoCycle).toBeGreaterThanOrEqual(0);
        expect(c.daysIntoCycle).toBeLessThan(m.cycleLength);

        m.cycleLength = 0;
        const d = m.getMoonState(tCal, dayStart);
        expect(d.daysIntoCycle).toBe(0);
        expect(d.cycleFraction).toBe(0);
    });

    test("Solar Position", () => {
        // Gregorian predefined seasons: sunrise 06:00, sunset 18:00 all year
        const dayStart = DateToTimestamp({ year: 2000, month: 0, day: 20, hour: 0, minute: 0, seconds: 0 }, tCal);
        const hour = 3600;
        expect(tCal.getSunEvents(dayStart + 12 * hour)).toStrictEqual([
            dayStart - 18 * hour,
            dayStart - 6 * hour,
            dayStart + 6 * hour,
            dayStart + 18 * hour,
            dayStart + 30 * hour,
            dayStart + 42 * hour
        ]);
        expect(tCal.getSolarPosition(dayStart + 6 * hour)).toBeCloseTo(0);
        expect(tCal.getSolarPosition(dayStart + 12 * hour)).toBeCloseTo(0.25);
        expect(tCal.getSolarPosition(dayStart + 18 * hour)).toBeCloseTo(0.5);
        expect(tCal.getSolarPosition(dayStart)).toBeCloseTo(0.75);
    });

    test("Phase Angle and Up", () => {
        expect(m.phaseAngleFor(0.5)).toBeCloseTo(0);
        expect(m.phaseAngleFor(0.5 + m.cycleLength / 2)).toBeCloseTo(0.5);
        expect(m.phaseAngleFor(0)).toBeCloseTo(1 - 0.5 / m.cycleLength);

        // New moon: up with the sun. Full moon: up while the sun is down.
        expect(Moon.isUpAt(0.25, 0)).toBe(true);
        expect(Moon.isUpAt(0.75, 0)).toBe(false);
        expect(Moon.isUpAt(0.75, 0.5)).toBe(true);
        expect(Moon.isUpAt(0.25, 0.5)).toBe(false);
        // First quarter: up from midday to the middle of the night
        expect(Moon.isUpAt(0.3, 0.25)).toBe(true);
        expect(Moon.isUpAt(0.2, 0.25)).toBe(false);
    });

    test("Get Rise Set", () => {
        const dayStart = DateToTimestamp({ year: 2000, month: 0, day: 20, hour: 0, minute: 0, seconds: 0 }, tCal);
        const times = m.getRiseSet(tCal, dayStart + 3600);
        expect(times.rise === null && times.set === null).toBe(false);
        for (const [moment, upAfter] of [
            [times.rise, true],
            [times.set, false]
        ] as [number | null, boolean][]) {
            if (moment === null) continue;
            expect(moment).toBeGreaterThanOrEqual(dayStart);
            expect(moment).toBeLessThan(dayStart + tCal.time.secondsPerDay);
            expect(m.getMoonState(tCal, moment + 60).up).toBe(upAfter);
            expect(m.getMoonState(tCal, moment - 60).up).toBe(!upAfter);
        }

        // Over a whole cycle, most days have both and none has two of either
        let both = 0;
        for (let d = 0; d < 30; d++) {
            const t = m.getRiseSet(tCal, dayStart + d * tCal.time.secondsPerDay + 3600);
            if (t.rise !== null && t.set !== null) both++;
        }
        expect(both).toBeGreaterThanOrEqual(27);

        m.cycleLength = 0;
        expect(m.getRiseSet(tCal, dayStart)).toStrictEqual({ rise: null, set: null });
    });

    test("Get Moon Phase", () => {
        expect(m.getMoonPhase(tCal)).toBeDefined();
        expect(m.getMoonPhase(tCal, "selected")).toBeDefined();
        expect(m.getMoonPhase(tCal, "visible")).toBeDefined();
    });
});
