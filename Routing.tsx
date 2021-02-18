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
  NotFoundPage?: JSX.Element
}) {
  let {
    routes,
    overridePath
  } = props;

  const l = window.location;

  // Correct routes.
  routes = routes.map(r => { r.priority = r.priority ?? 0; return r; }).sort((r, r2) => r2.priority - r.priority);

  // Parse routes
  let path = overridePath ?? l.pathname;
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
    return props.NotFoundPage ?? (<div>
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
        return ((route as PageRouteStatic).page as (() => JSX.Element))();
      }
      else if (route.name instanceof RegExp) {
        let matches = path.match(route.name);
        let m = matches.shift();
        return ((route as PageRouteDynamic).page as ((match: string, ...rest: string[]) => JSX.Element))(m, ...matches);
      }
      else {
        return (<div>Internal Error</div>);
      }
    }
    else {
      return route.page;
    }
  } catch (error) {
    return props.NotFoundPage ?? (<div>
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