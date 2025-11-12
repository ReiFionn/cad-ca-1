## Assignment - Cloud App Development.

__Name:__ Fionn Reilly 
### Links.
__Demo:__ A link to your YouTube video demonstration.

### Screenshots.

[A screenshot of the App Web API from the management console, e.g.

![][api]

The Auth API is not required as its code was provided in the labs.

]

[A screenshot of your seeded table from DynamoDB, e.g.

![][db]
]

[A screenshot from CloudWatch logs showing an example of User Activity logging, e.g.

jbloggs /awards?movie=1234&awardBody=Academy

![][cw]
]

### Design features (if required).

![][diagram]

The app uses a custom L2 construct ***AuthApi*** to encapsulate and reuse AWS resources with consistent configurations.

The app is split into 3 different stacks:
- api-stack: Defines the API Gateway endpoints, custom authorizer, and associated lambda functions
- cognito-stack: Defines user authentication resources (User Pool and App Client)
- data-stack: Creates and seeds the DynamoDB table with movies, actors, cast, and awards data. Configures DynamoDB Streams for logging state changes.

###  Extra (If relevant).

[ State any other aspects of your solution that use CDK/serverless features not covered in the lectures.]



[api]: ./images/api.png
[db]: ./images/db.png
[cw]: ./images/cw.png
[diagram]: ./images/diagram.png

