// utility class for formatting strings
export class PrettyStrings{
    // creates a new string that uses title case on each word ('tHe wOrld iS' -> 'The World Is')
    static toTitleCase(str){
        return str.split(" ").map(word => word[0].toUpperCase() + word.substr(1).toLowerCase()).join(" ");
    }
}