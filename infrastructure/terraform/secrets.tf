# Secrets Manager for Weather API Key
resource "aws_secretsmanager_secret" "weather_api_key" {
  name                    = "weather-app-api-key-${var.environment}"
  description             = "WeatherAPI.com API key"
  recovery_window_in_days = 7

  tags = {
    Name = "weather-app-api-key"
  }
}

resource "aws_secretsmanager_secret_version" "weather_api_key" {
  secret_id     = aws_secretsmanager_secret.weather_api_key.id
  secret_string = var.weather_api_key
}

# IAM Policy for accessing secrets
resource "aws_iam_role_policy" "ecs_secrets" {
  name = "ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.weather_api_key.arn
        ]
      }
    ]
  })
}
