import { PolicyType } from "./policyType.model";

export interface PolicyConfiguration {
    isBlocking: boolean;
    isEnabled: boolean;
    type: PolicyType;
}