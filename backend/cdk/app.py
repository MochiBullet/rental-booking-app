#!/usr/bin/env python3
import os
import aws_cdk as cdk
from aws_cdk import Stack
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_lambda as lambda_
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_iam as iam
from constructs import Construct

class RentalBookingBackendStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Tables
        # Members Table
        members_table = dynamodb.Table(
            self, "MembersTable",
            table_name="rental-booking-members",
            partition_key=dynamodb.Attribute(
                name="memberId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for email lookup
        members_table.add_global_secondary_index(
            index_name="email-index",
            partition_key=dynamodb.Attribute(
                name="email",
                type=dynamodb.AttributeType.STRING
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )

        # Vehicles Table
        vehicles_table = dynamodb.Table(
            self, "VehiclesTable",
            table_name="rental-booking-vehicles",
            partition_key=dynamodb.Attribute(
                name="vehicleId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )
        
        # GSI for vehicle type
        vehicles_table.add_global_secondary_index(
            index_name="type-index",
            partition_key=dynamodb.Attribute(
                name="vehicleType",
                type=dynamodb.AttributeType.STRING
            ),
            projection_type=dynamodb.ProjectionType.ALL
        )

        # Reservations Table
        reservations_table = dynamodb.Table(
            self, "ReservationsTable",
            table_name="rental-booking-reservations",
            partition_key=dynamodb.Attribute(
                name="reservationId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
            point_in_time_recovery=True
        )

        # Lambda Layer for common functions
        lambda_layer = lambda_.LayerVersion(
            self, "CommonLayer",
            code=lambda_.Code.from_asset("../lambda/layer"),
            compatible_runtimes=[lambda_.Runtime.PYTHON_3_11],
            description="Common utilities for Lambda functions"
        )

        # Lambda Execution Role
        lambda_role = iam.Role(
            self, "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole")
            ]
        )

        # Grant DynamoDB permissions
        members_table.grant_read_write_data(lambda_role)
        vehicles_table.grant_read_write_data(lambda_role)
        reservations_table.grant_read_write_data(lambda_role)

        # Members Lambda Function
        members_lambda = lambda_.Function(
            self, "MembersFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            code=lambda_.Code.from_asset("../lambda/members"),
            handler="handler.main",
            environment={
                "MEMBERS_TABLE": members_table.table_name,
                "CORS_ORIGIN": "*"
            },
            layers=[lambda_layer],
            role=lambda_role,
            timeout=cdk.Duration.seconds(30),
            memory_size=256
        )

        # Vehicles Lambda Function
        vehicles_lambda = lambda_.Function(
            self, "VehiclesFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            code=lambda_.Code.from_asset("../lambda/vehicles"),
            handler="handler.main",
            environment={
                "VEHICLES_TABLE": vehicles_table.table_name,
                "CORS_ORIGIN": "*"
            },
            layers=[lambda_layer],
            role=lambda_role,
            timeout=cdk.Duration.seconds(30),
            memory_size=256
        )

        # Reservations Lambda Function
        reservations_lambda = lambda_.Function(
            self, "ReservationsFunction",
            runtime=lambda_.Runtime.PYTHON_3_11,
            code=lambda_.Code.from_asset("../lambda/reservations"),
            handler="handler.lambda_handler",
            environment={
                "RESERVATIONS_TABLE": reservations_table.table_name,
                "MEMBERS_TABLE": members_table.table_name,
                "VEHICLES_TABLE": vehicles_table.table_name,
                "CORS_ORIGIN": "*"
            },
            layers=[lambda_layer],
            role=lambda_role,
            timeout=cdk.Duration.seconds(30),
            memory_size=256
        )

        # API Gateway
        api = apigateway.RestApi(
            self, "RentalBookingAPI",
            rest_api_name="rental-booking-api",
            description="Rental Booking Backend API",
            default_cors_preflight_options={
                "allow_origins": apigateway.Cors.ALL_ORIGINS,
                "allow_methods": apigateway.Cors.ALL_METHODS,
                "allow_headers": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
                "allow_credentials": True
            }
        )

        # API Resources
        members_resource = api.root.add_resource("members")
        members_resource.add_method("GET", apigateway.LambdaIntegration(members_lambda))
        members_resource.add_method("POST", apigateway.LambdaIntegration(members_lambda))
        
        member_resource = members_resource.add_resource("{memberId}")
        member_resource.add_method("GET", apigateway.LambdaIntegration(members_lambda))
        member_resource.add_method("PUT", apigateway.LambdaIntegration(members_lambda))
        member_resource.add_method("DELETE", apigateway.LambdaIntegration(members_lambda))

        vehicles_resource = api.root.add_resource("vehicles")
        vehicles_resource.add_method("GET", apigateway.LambdaIntegration(vehicles_lambda))
        vehicles_resource.add_method("POST", apigateway.LambdaIntegration(vehicles_lambda))
        
        vehicle_resource = vehicles_resource.add_resource("{vehicleId}")
        vehicle_resource.add_method("GET", apigateway.LambdaIntegration(vehicles_lambda))
        vehicle_resource.add_method("PUT", apigateway.LambdaIntegration(vehicles_lambda))
        vehicle_resource.add_method("DELETE", apigateway.LambdaIntegration(vehicles_lambda))

        reservations_resource = api.root.add_resource("reservations")
        reservations_resource.add_method("GET", apigateway.LambdaIntegration(reservations_lambda))
        reservations_resource.add_method("POST", apigateway.LambdaIntegration(reservations_lambda))
        
        reservation_resource = reservations_resource.add_resource("{id}")
        reservation_resource.add_method("GET", apigateway.LambdaIntegration(reservations_lambda))
        reservation_resource.add_method("PUT", apigateway.LambdaIntegration(reservations_lambda))
        reservation_resource.add_method("DELETE", apigateway.LambdaIntegration(reservations_lambda))

        # Outputs
        cdk.CfnOutput(
            self, "APIEndpoint",
            value=api.url,
            description="API Gateway endpoint URL"
        )
        
        cdk.CfnOutput(
            self, "MembersTableName",
            value=members_table.table_name,
            description="DynamoDB Members table name"
        )
        
        cdk.CfnOutput(
            self, "VehiclesTableName",
            value=vehicles_table.table_name,
            description="DynamoDB Vehicles table name"
        )
        
        cdk.CfnOutput(
            self, "ReservationsTableName",
            value=reservations_table.table_name,
            description="DynamoDB Reservations table name"
        )

app = cdk.App()
RentalBookingBackendStack(app, "RentalBookingBackendStack",
    env=cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region='ap-southeast-2'
    )
)
app.synth()