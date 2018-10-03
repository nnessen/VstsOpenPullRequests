import { PolicyConfiguration } from "./policyConfiguration.model";

export interface PolicyEvaluation {
    artifactId: string;
    configuration: PolicyConfiguration;
    evaluationId: string;
    startedDate: string;
    status: string;
}