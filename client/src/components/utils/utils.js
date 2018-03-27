const utils = {
    replaceString: (str, rep, pos) => {
        if (pos >= str.length) {
            throw new Error('Position out of bounds');
        }
        return str.substr(0, pos) + rep + str.substr(pos + rep.length);
    },
    toProperCase: (name) => {
        let newStr = name;

        // First Char
        if (typeof newStr !== 'string' || newStr.length === 0) {
            throw new Error('Empty or Invalid String');
        }
        newStr = utils.replaceString(newStr, newStr.charAt(0).toUpperCase(), 0);

        const separators = [' ', '_'];

        for (const index in separators) {
            const sep = separators[index];

            let charPos = newStr.indexOf(sep);
            while (charPos !== -1) {
                newStr = utils.replaceString(newStr, newStr.charAt(charPos + 1).toUpperCase(), charPos + 1);
                charPos = newStr.indexOf(sep, charPos + 1);
            }
        }

        return newStr;
    }
};

export default utils;
