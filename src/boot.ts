import { App } from './app';

VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true,
    usePlatformStyles: true
});

VSS.ready(() => {
    VSS.require([
        "VSS/Service",
        "TFS/VersionControl/GitRestClient"
        ],
        (vssService, gitClient) => {

            let context = VSS.getWebContext();
            let gitHttpClient = vssService.getCollectionClient(gitClient.GitHttpClient);

            if (context && gitHttpClient) {
                VSS.notifyLoadSucceeded();
            }
            else {
                VSS.notifyLoadFailed("Web Context or Git Client did not load.");
                return;
            }

            let baseUri = `${context.host.uri + context.project.name}`;
            let app = new App(context, gitHttpClient, baseUri);
            app.loadData();
        }
    )
});