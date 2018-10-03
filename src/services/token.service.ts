export class TokenService {

    constructor(
        private getVssToken: () => IPromise<ISessionToken>
    ) {
    }

    getToken() {
        return this.getVssToken();
    }
}