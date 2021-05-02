import React from "react";
/**
 * Routing v4
 */
function Router(props: {
  /**
   * Possible routes and their relative conditions.
   */
  routes: PageRoute[],
  /**
   * Override the current path by defining this with a path.
   */
  overridePath?: string,
  /**
   * 404 page if no page is found.
   */
  notFoundPage?: JSX.Element
}) {
  let {
    routes,
    overridePath
  } = props;

  // Correct routes.
  if (routes.length > 1) routes = routes.map(r => {
    r.priority = r.priority ?? 0;
    return r;
  }).sort((r, r2) => (r2.priority ?? 0) - (r.priority ?? 0));

  // Parse routes
  let path = overridePath ?? window.location.pathname;
  let route = routes.find(r => {
    if (typeof r.name === "string") {
      return r.name === path;
    }
    else if (r.name instanceof RegExp) {
      return r.name.test(path);
    }
    return false;
  });

  if (!route) {
    return props.notFoundPage ?? (<div>
      <h1>404</h1>
      <p>The page could not be found.</p>
    </div>);
  }

  if (route.redirect) {
    window.location.href = route.redirect;
    return (<></>);
  }

  try {
    if (typeof route.page === "function") {
      if (typeof route.name === "string") {
        return ((route as PageRouteStatic).page as (() => JSX.Element))();
      }
      else if (route.name instanceof RegExp) {
        let matches = path.match(route.name);
        if (!matches) throw "No matches found";
        let m = matches.shift() ?? "";
        return ((route as PageRouteDynamic).page as ((match: string, ...rest: string[]) => JSX.Element))(m, ...matches);
      }
      else {
        return (
          <div>
            <p>Internal Error</p>
            <p>Unknown Error</p>
          </div>
        );
      }
    }
    else {
      if (!route.page) return (
        <div>
          <p>Internal Error</p>
          <p>Missing page</p>
        </div>
      );
      return route.page;
    }
  } catch (error) {
    return props.notFoundPage ?? (<div>
      <h1>404</h1>
      <p>The page cound not be found.</p>
    </div>)
  }
}

export interface PageRouteDynamic {
  name: RegExp;
  page?: JSX.Element | ((match: string, ...rest: string[]) => JSX.Element);
  redirect?: string;
  priority?: number;
}

export interface PageRouteStatic {
  name: string;
  page?: JSX.Element | (() => JSX.Element);
  redirect?: string;
  priority?: number;
}

export type PageRoute = PageRouteDynamic | PageRouteStatic;

export default Router;