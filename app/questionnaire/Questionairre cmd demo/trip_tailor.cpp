#include <iostream>
#include <vector>
#include <string>

using namespace std;

string askQuestion(string question, vector<string> validInputs) {
    string input;

    cout << "\n" << question << endl;

    // Display options (no quotation marks)
    for (int i = 0; i < validInputs.size(); i++) {
        cout << validInputs[i] << "   ";
    }
    cout << endl;

    while (true) {
        cout << "Enter your answer exactly as shown: ";
        getline(cin, input);

        for (int i = 0; i < validInputs.size(); i++) {
            if (input == validInputs[i]) {
                return input;
            }
        }

        cout << "Invalid input. Please try again.\n";
    }
}

int main() {

    cout << "=== Welcome to Trip Tailor ===" << endl;

    string q1 = askQuestion(
        "Q1. Welcome to Trip Tailor! Are you ready to plan your trip?",
        {"Yes", "No"}
    );

    string q2 = askQuestion(
        "Q2. What kind of Trip do you envision?",
        {"Relaxing", "High-Octane", "Somewhere in-between"}
    );

    string q3 = askQuestion(
        "Q3. What would you like to do more in this trip?",
        {"Sightseeing", "Interact", "Both"}
    );

    string q4 = askQuestion(
        "Q4. How far are you willing to travel?",
        {"1 - 500 miles", "In the continent", "overseas"}
    );

    string q5 = askQuestion(
        "Q5. How close to nature would you like this trip to be?",
        {"Very-close", "Mixed", "Indoor only"}
    );

    string q6 = askQuestion(
        "Q6. Who will this Trip be for?",
        {"Children", "Family", "Adult"}
    );

    string q7 = askQuestion(
        "Q7. How much energy level are you willing to spend on this event:",
        {"1", "2", "3", "4", "5"}
    );

    string q8 = askQuestion(
        "Q8. How long do you want to spend on each site?",
        {"0", "1", "2", "3", "4", "5", "6", "7", "8"}
    );

    string q9 = askQuestion(
        "Q9. How many site do you want to go on the day of the trip?",
        {"1", "2", "3", "4", "5"}
    );

    string q10 = askQuestion(
        "Q10. Do you, or anyone you're with need disability accommodation?",
        {"Yes", "No"}
    );

    cout << "\n=== Trip Summary ===" << endl;
    cout << "Q1: " << q1 << endl;
    cout << "Q2: " << q2 << endl;
    cout << "Q3: " << q3 << endl;
    cout << "Q4: " << q4 << endl;
    cout << "Q5: " << q5 << endl;
    cout << "Q6: " << q6 << endl;
    cout << "Q7: " << q7 << endl;
    cout << "Q8: " << q8 << endl;
    cout << "Q9: " << q9 << endl;
    cout << "Q10: " << q10 << endl;

    return 0;
}
