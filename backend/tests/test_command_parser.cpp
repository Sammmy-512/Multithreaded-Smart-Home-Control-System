// test_command_parser.cpp
// unit tests for parseCommand() to make sure it handles all cases correctly
#include <iostream>
#include <string>
#include "../utilities/CommandParser.h"

using namespace seneca;

// simple helper that prints pass or fail
static void check(const std::string& testName, bool condition) {
    std::cout << (condition ? "[PASS] " : "[FAIL] ") << testName << std::endl;
}

int main() {
    std::string device, action;

    // --- valid commands ---

    // basic light on command
    check("GET /light/on",
        parseCommand("GET /light/on", device, action) && device == "light" && action == "on");

    // basic light off command
    check("GET /light/off",
        parseCommand("GET /light/off", device, action) && device == "light" && action == "off");

    // thermostat with deeper action path
    check("GET /thermostat/set/22",
        parseCommand("GET /thermostat/set/22", device, action) && device == "thermostat" && action == "set/22");

    // security camera status check
    check("GET /camera/status",
        parseCommand("GET /camera/status", device, action) && device == "camera" && action == "status");

    // --- invalid commands ---

    // not a GET request
    check("POST /light/on should fail",
        !parseCommand("POST /light/on", device, action));

    // missing the action part
    check("GET /light should fail",
        !parseCommand("GET /light", device, action));

    // missing leading slash
    check("GET light/on should fail",
        !parseCommand("GET light/on", device, action));

    // completely wrong format
    check("random string should fail",
        !parseCommand("hello", device, action));

    // empty string
    check("empty string should fail",
        !parseCommand("", device, action));

    // GET with nothing after it
    check("GET with empty path should fail",
        !parseCommand("GET /", device, action));

    return 0;
}
