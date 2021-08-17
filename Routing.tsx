import React from "react";

let routerContext: React.Context<React.Dispatch<React.SetStateAction<string | undefined>>>;

// Router
/**
 * Routing v4
 */
export default function Router(props: {
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
  notFoundPage?: JSX.Element,
  /**
   * Whether or not the router should automatically reroute when the URL has changed.
   * 
   * This is helpful for when the user goes back or forward in the browser, after using a `<Link>` component to change the URL.
   * 
   * @default true
   */
  autoReroute?: boolean,
}) {
  
  const [pathState, setPathState] = React.useState<string>();
  const [pageData, setPageData] = React.useState<JSX.Element>();
  React.useEffect(() => {
    function popStateHandler(e: PopStateEvent) {
      setTimeout(() => {
        setPathState(window.location.pathname);
      }, 10);
    }
    if (props.autoReroute ?? true) {
  
      window.addEventListener("popstate", popStateHandler);
      return () => window.removeEventListener("popstate", popStateHandler);
    }
  });

  if (pageData !== undefined) {
    return pageData;
  }

  routerContext = React.createContext(setPathState);
  
  let {
    routes,
    overridePath,
    notFoundPage
  } = props;

  // Correct routes.
  if (routes.length > 1) routes = routes.map(r => { r.priority = r.priority ?? 0; return r; }).sort((r, r2) => (r2.priority ?? 0) - (r.priority ?? 0));

  // Parse routes
  let path = overridePath ?? window.location.pathname;
  if (pathState && pathState !== window.location.pathname) {
    window.history.pushState(null, "", pathState);
    path = window.location.pathname;
  }
  const checkCondtions = (condition: PageRoute["condition"]) => typeof condition === "function" ? condition() : true;
  let route = routes.find(r => {
    if (typeof r.name === "string") {
      return r.name === path && checkCondtions(r.condition);
    }
    else if (r.name instanceof RegExp) {
      return r.name.test(path) && checkCondtions(r.condition);
    }
    return false;
  });

  if (!route) {
    return notFoundPage ?? (<div>
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
        let loadedPage = ((route as PageRouteStatic).page as (() => Promise<JSX.Element>))();
        Promise.resolve().then(async () => {
          setPageData(await loadedPage);
        });
        return (<>Please wait while the page loads...</>) // Should be user defined loading page?
      }
      else if (route.name instanceof RegExp) {
        let matches = path.match(route.name);
        if (matches === null || matches.length > 0) return (<></>);
        let m = matches.shift() as string;
        let loadedPage = ((route as PageRouteDynamic).page as ((match: string, ...rest: string[]) => Promise<JSX.Element>))(m, ...matches);
        Promise.resolve().then(async () => {
          setPageData(await loadedPage);
        });
        return (<>Please wait while the page loads...</>) // Should be user defined loading page?
      }
      return (
        <div>
          <p>Internal Error</p>
          <p>Unknown Error</p>
        </div>
      );
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
    return notFoundPage ?? (<div>
      <h1>404</h1>
      <p>The page cound not be found.</p>
    </div>)
  }
}

export interface PageRouteBase {
  /**
   * If `page` is unset, use this to redirect to a different page url.
   */
  redirect?: string;
  /**
   * If 2 or more routes match, the one with the highest priority is used.
   * @type number
   */
  priority?: number;
  /**
   * Check conditions if the route should be used. Function that returns a boolean.
   * 
   * If `condition` returns `true`, the route will be used.
   * otherwise, the route will not be used and second higher priority routes will be used.
   */
  condition?: () => boolean;
}

export interface PageRouteDynamic extends PageRouteBase {
  name: RegExp;
  page?: JSX.Element | ((match: string, ...rest: string[]) => Promise<JSX.Element> | JSX.Element);
}

export interface PageRouteStatic extends PageRouteBase {
  name: string;
  page?: JSX.Element | (() => Promise<JSX.Element> | JSX.Element);
}

export type PageRoute = PageRouteDynamic | PageRouteStatic;

// Link
/**
 * The `href` attribute can only be used for local/same origin URLs. Relative and absolute URLs should work just fine.
 * @param props Identical to a HTMLAnchorElement's attribute
 * @returns 
 */
export const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>, ref) {
    const setPage = React.useContext(routerContext);
    
    const { onClick, href } = props;
    delete props.onClick;
  
    return (
      <a ref={ref} {...props} onClick={e => {
        e.preventDefault();
        if (typeof onClick === "function") onClick(e);
        setPage(href ?? "#");
      }}>{props.children}</a>
    )
  }
)
