// CommandParser.h
// parses commands from clients in the format "GET /device/action"
// separated into its own file so it can be tested independently
#ifndef SENECA_COMMAND_PARSER_H
#define SENECA_COMMAND_PARSER_H

#include <string>

namespace seneca {

    // takes a raw command string and splits it into device and action
    // returns true if the command is valid, false otherwise
    // "GET /light/on" -> device="light", action="on"
    // "GET /thermostat/set/22" -> device="thermostat", action="set/22"
    inline bool parseCommand(const std::string& raw, std::string& device, std::string& action) {
        // make sure it starts with GET
        if (raw.substr(0, 4) != "GET ")
            return false;

        std::string path = raw.substr(4); // grab everything after "GET "
        if (path.empty() || path[0] != '/')
            return false;

        path = path.substr(1); // remove the leading slash
        size_t slash = path.find('/');
        if (slash == std::string::npos)
            return false;

        // split the path into device and action at the slash
        device = path.substr(0, slash);
        action = path.substr(slash + 1);
	size_t queryPos = action.find('?');
if (queryPos != std::string::npos) {
    action = action.substr(0, queryPos);
}
        return true;
    }

} // namespace seneca
#endif
