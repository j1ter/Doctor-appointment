import { createContext } from "react"

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const calculateAge = (dob) => {
        if (!dob || typeof dob !== 'string') {
            console.warn(`Invalid dob: ${dob}`);
            return "Не указано";
        }

        let birthDate;
        try {
            // Поддержка форматов YYYY-MM-DD, DD-MM-YYYY, DD.MM.YYYY
            let year, month, day;
            if (dob.includes('-') && dob.split('-').length === 3) {
                const parts = dob.split('-');
                if (parts[0].length <= 2) { // DD-MM-YYYY
                    [day, month, year] = parts;
                } else { // YYYY-MM-DD
                    [year, month, day] = parts;
                }
            } else if (dob.includes('.') && dob.split('.').length === 3) { // DD.MM.YYYY
                [day, month, year] = dob.split('.');
            } else {
                birthDate = new Date(dob);
            }

            if (year && month && day) {
                // Приведение к числовому формату, добавление ведущих нулей
                month = parseInt(month, 10).toString().padStart(2, '0');
                day = parseInt(day, 10).toString().padStart(2, '0');
                birthDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
            }

            if (isNaN(birthDate.getTime())) {
                console.warn(`Invalid date format for dob: ${dob}`);
                return "Не указано";
            }

            const today = new Date();
            // Устанавливаем время на полночь для исключения влияния часового пояса
            today.setHours(0, 0, 0, 0);
            birthDate.setHours(0, 0, 0, 0);

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }

            console.debug(`calculateAge: dob=${dob}, birthDate=${birthDate}, today=${today}, age=${age}`);

            if (isNaN(age) || age < 0 || age > 120) {
                console.warn(`Calculated age is invalid: ${age}, dob: ${dob}`);
                return "Не указано";
            }
            return age;
        } catch (error) {
            console.error(`Error processing dob: ${dob}, error: ${error.message}`);
            return "Не указано";
        }
    }

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    const value = {
        calculateAge,
        slotDateFormat,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider