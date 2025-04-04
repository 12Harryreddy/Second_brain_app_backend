"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = void 0;
const random = (len) => {
    const options = "hauiefhoeuhfrieufy89741HVFUFRUIHGIUYFG747617";
    let res = "";
    for (let i = 0; i < len; i++) {
        res += options[Math.floor(Math.random() * options.length)];
    }
    return res;
};
exports.random = random;
