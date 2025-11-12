## Assignment - Cloud App Development.

__Name:__ Fionn Reilly 

### Links
__Demo:__ A link to your YouTube video demonstration.

### Screenshots

Screenshot of the App Web API from the management console:

![][api]

Screenshot of seeded table from DynamoDB:

![][db]


Screenshot from CloudWatch logs showing an example of User Activity logging:

![][cw]

Screenshot from CloudWatch logs showing an example of State Change logging:

![][cwsc]


### Design features

![][diagram]

The app uses a custom L2 construct ***AuthApi*** to encapsulate and reuse AWS resources with consistent configurations.

The app is split into 3 different stacks:
- api-stack: Defines the API Gateway endpoints, custom authorizer, and associated lambda functions
- cognito-stack: Defines user authentication resources (User Pool and App Client)
- data-stack: Creates and seeds the DynamoDB table with movies, actors, cast, and awards data. Configures DynamoDB Streams for logging state changes.

User logging for every request + state change logging on administrative requests (POST + DELETE)

###  Extra

- Multi-stacking
- API Key generation and usage plans for administrative requests

[api]: ./images/api.png
[db]: ./images/db.png
[cw]: ./images/cw.png
[diagram]: ./images/diagram.png
[cwsc]: ./images/cwsc.png
