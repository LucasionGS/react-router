"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
/**
 * Routing v4
 */
function Router(props) {
    var _a;
    var _b, _c;
    var routes = props.routes, overridePath = props.overridePath;
    var l = window.location;
    // Correct routes.
    routes = routes.map(function (r) { var _a; r.priority = (_a = r.priority) !== null && _a !== void 0 ? _a : 0; return r; }).sort(function (r, r2) { return r2.priority - r.priority; });
    // Parse routes
    var path = overridePath !== null && overridePath !== void 0 ? overridePath : l.pathname;
    var route = routes.find(function (r) {
        if (typeof r.name === "string") {
            return r.name === path;
        }
        else if (r.name instanceof RegExp) {
            return r.name.test(path);
        }
        return false;
    });
    if (!route) {
        return (_b = props.NotFoundPage) !== null && _b !== void 0 ? _b : (<div>
      <h1>404</h1>
      <p>The page cound not be found.</p>
    </div>);
    }
    if (route.redirect) {
        window.location.href = route.redirect;
        return (<div></div>);
    }
    try {
        if (typeof route.page === "function") {
            if (typeof route.name === "string") {
                return route.page();
            }
            else if (route.name instanceof RegExp) {
                var matches = path.match(route.name);
                var m = matches.shift();
                return (_a = route).page.apply(_a, __spreadArrays([m], matches));
            }
            else {
                return (<div>Internal Error</div>);
            }
        }
        else {
            return route.page;
        }
    }
    catch (error) {
        return (_c = props.NotFoundPage) !== null && _c !== void 0 ? _c : (<div>
      <h1>404</h1>
      <p>The page cound not be found.</p>
    </div>);
    }
}
exports["default"] = Router;
