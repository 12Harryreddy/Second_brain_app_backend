

export const random = (len: number) => {
    const options = "hauiefhoeuhfrieufy89741HVFUFRUIHGIUYFG747617";
    let res = "";

    for(let i = 0; i < len; i++) {
        res += options[Math.floor(Math.random() * options.length)];
    }

    return res;
}