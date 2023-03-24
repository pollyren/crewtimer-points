/**
 * Given an event name, determine the number of athletes (aka seats) involved.
 * @param eventName The event name to inspect.
 * @returns The number of athlets in each entry.
 */
export const numSeatsFromName = (eventName: string) => {
    if (eventName.match(/1x/i)) {
        return 2;
    }
    if (eventName.match(/2x/i)) {
        return 2;
    }
    if (eventName.match(/4[x+]/i)) {
        return 4;
    }
    if (eventName.match(/8[x+]/i)) {
        return 8;
    }

    // ACA Canoe Kayak
    if (eventName.match(/[CK1]/i)) {
        return 1;
    }
    if (eventName.match(/[CK]2/i)) {
        return 2;
    }
    if (eventName.match(/[CK]4/i)) {
        return 4;
    }
    return 1;
}

/**
 * Define regex for detecting progression suffixes.  Each
 * entry is a triple of [Abbrev Prexix, RegEx to detect, RegEx for suffix | suffix, RefEx for timingIndex]
 */
const RegexTimingNames: [string, RegExp, RegExp | string][] = [
    ['QAD', /QAD[1-4]$/i, /[1-4]$/],
    ['QEH', /QEH[1-4]$/i, /[1-4]$/],
    ['QAD', /QF[1-4]+$/i, /[1-4]$/],
    ['SAB', /SAB[1-4]+$/i, /[1-4]$/],
    ['SAB', /S(emi)? *[1-4]+$/i, /[1-4]$/],
    ['SCD', /SCD[1-4]+$/i, /[1-4]$/],
    ['SEF', /SEF[1-4]+$/i, /[1-4]$/],
    ['SGH', /SGH[1-4]+$/i, /[1-4]$/],
    ['TF', /T(imed)? *F(inal)? *[A-D]$/i, /[A-D]$/i], // test before FA,FB
    ['TF', /T(imed)? *F(inal)?$/i, 'A'],
    ['H', /H(eat)? *[1-9][0-9]*$/i, /[1-9][0-9]*$/], // must be after QEH
    ['FA', /Final$/i, ''],
    ['FA', /F(inal)? *A$/i, ''],
    ['FB', /F(inal)? *B$/i, ''],
    ['FC', /F(inal)? *C$/i, ''],
    ['FD', /F(inal)? *D$/i, ''],
    ['FE', /F(inal)? *E$/i, ''],
    ['FF', /F(inal)? *F$/i, ''],
    ['FG', /F(inal)? *G$/i, ''],
    ['FH', /F(inal)? *H$/i, ''],
    ['TT', /T(ime)? *T(rial)?$/i, '1'],
    ['TT', /T(ime)? *T(rial)?[1-9][0-9]*$/i, /[1-9][0-9]*$/],
    // unsupported
    ['Err: Must be QAD1-4', /QAD$/i, ''],
    ['Err: Must be QEH1-4', /QEH$/i, ''],
    ['Err', /SAB$/i, 'Must be SAB11-4'],
    ['Err', /SCD$/i, 'Must be SCD1-4'],
];

/** Given an event name as '1 Womens Varsity H1', separate into
 * eventName = 'Womens Varsity'
 * bracket = 'H1'
 * bracketType = 'H'
 *
 * @param name The Event Name extracted from the spreadsheet
 * @returns {eventName: string, bracket: string bracketType: string, bracketIndex: number}
 */
const decodeEventName = (name: string, eventNum: string) => {
    let bracket = 'FA';
    let bracketType = 'FA';
    let bracketIndex = '1';
    let eventName = name.substring(eventNum.length); // remove event num
    // Try each RegEx pattern until a match is found
    for (let i = 0; i < RegexTimingNames.length; i++) {
        const [code, identifyRegex, indexRegex] = RegexTimingNames[i];
        const index = eventName.search(identifyRegex);
        if (index < 0) {
            continue;
        }

        // We have a match!
        if (typeof indexRegex === 'string') {
            bracketIndex = indexRegex;
        } else {
            bracketIndex = eventName.match(indexRegex)?.[0] || '1';
        }

        bracketType = code;
        bracket = `${code}${bracketIndex}`.toUpperCase();

        if (bracketType === 'TF') {
            bracketType = `${code}${bracketIndex}`;
            bracket = bracketType;
        }


        eventName = eventName.substring(0, index);
        break;
    }
    eventName = eventName.trim();

    const result = {
        eventName,
        bracket,
        bracketType,
    };
    // console.log(JSON.stringify(result));
    return result;
};

/**
 * Determine if an event is a final and which level (A, B, C etc).
 * If the event is not a final, '' is returned.
 * 
 * @param name The name to evaluate
 */
export const getFinalLevel = (eventName: string, eventNum: string) => {
    const { bracket, bracketType } = decodeEventName(eventName, eventNum);
    return (bracket === bracketType) ? bracket.charAt(bracket.length - 1) : '';
}