class Utility {
    static parseMonth(number) {
        switch(number){
            case "0" : return "Jan"
            case "01" : return "Feb"
            case "02" : return "Mar"
            case "03" : return "Apr"
            case "04" : return "May"
            case "05" : return "Jun"
            case "06" : return "Jul"
            case "07" : return "Aug"
            case "08" : return "Sep"
            case "09" : return "Oct"
            case "10" : return "Nov"
            case "11" : return "Dec"
            default: "Err"
        }
    }
}

module.exports = Utility
