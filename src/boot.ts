import { App } from './app';
import { TokenService } from './services/token.service';

VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true,
    usePlatformStyles: true
});

VSS.ready(() => {
    VSS.require([
        "VSS/Service",
        "TFS/VersionControl/GitRestClient",
        "VSS/OrganizationPolicy/RestClient"
        ],
        (vssService, gitClient, policyClient) => {

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
            let tokenService = new TokenService(VSS.getAccessToken);
            let app = new App(context, gitHttpClient, baseUri, tokenService);
            app.loadData();
        }
    )
});