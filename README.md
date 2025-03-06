# Url Redirect

A Chrome extension that allows redirecting URLs according to configured rules.

## Features

- Redirecting URLs based on configured rules
- Enabling/disabling redirects using a toggle switch
- Adding, editing, and deleting redirect rules
- Support for labels for easier organization of rules
- Support for wildcard characters (* and ?) in source URLs

## How to Use

1. Install the extension in Chrome
2. Click on the extension icon in the browser toolbar
3. Use the toggle switch to enable/disable redirects
4. Click the "+" button to add a new redirect rule
5. Enter the source URL (the URL you want to redirect)
6. Enter the target URL (the URL you want to redirect to)
7. Optionally add a label for easier identification of the rule


### Simple Redirect

- Source URL: `https://example.com/old-page`
- Target URL: `https://example.com/new-page`

### Redirect with Wildcards

- Source URL: `https://example.com/fe/app-name/manifest.json*`
- Target URL: `https://localhost:8081/fe/app-name/manifest.json`

## How to use & Development

For extension development:

1. Clone the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Make changes to the code
6. Click the refresh button on the extension card to apply changes

## License

MIT
