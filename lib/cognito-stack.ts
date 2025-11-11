import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { AuthApi } from './constructs/auth-api'

export class CognitoStack extends cdk.Stack {
  userPool: UserPool;
  userPoolClientId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolId = this.userPool.userPoolId;

    const appClient = this.userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    this.userPoolClientId = appClient.userPoolClientId;

    new AuthApi(this, 'AuthServiceApi', {
      userPoolId: userPoolId,
      userPoolClientId: this.userPoolClientId,
    });
  } 
}
