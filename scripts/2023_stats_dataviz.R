# Load necessary libraries
library(ggplot2)
library(dplyr)

# Load the dataset
data_dir <- '~/Desktop/cfbdata'
cfb23 <- read.csv(file.path(data_dir, 'cfb23.csv'))

# Explore the dataset
str(cfb23)
summary(cfb23)

# Assume 'Score' is the target variable and we have several features
# Clean the dataset if necessary
cfb23 <- cfb23 %>%
  select(Team, Redzone.Scores, Off.Yards.Play, Off.TDs, Pass.Percent, Rush.Percent, Third.Percent) %>%
  na.omit()  # Remove rows with missing values

# Split the data into training and testing sets
set.seed(123)  # For reproducibility
train_indices <- sample(1:nrow(cfb23), size = 0.8 * nrow(cfb23))
train_data <- cfb23[train_indices, ]
test_data <- cfb23[-train_indices, ]

# Fit a linear regression model to predict Score
score_model <- lm(Score ~ Off.Yards.Play + Off.TDs + Pass.Percent + Rush.Percent + Third.Percent, data = train_data)

# Summary of the model
summary(score_model)

# Make predictions on the test set
predictions <- predict(score_model, newdata = test_data)

# Combine actual scores and predictions for comparison
results <- data.frame(
  Team = test_data$Team,
  Actual = test_data$Score,
  Predicted = predictions
)

# Evaluate model performance (e.g., mean squared error)
mse <- mean((results$Actual - results$Predicted)^2)
cat("Mean Squared Error:", mse, "\n")

# Plot actual vs. predicted scores
ggplot(results, aes(x = Actual, y = Predicted)) +
  geom_point(color = 'blue') +
  geom_abline(slope = 1, intercept = 0, color = 'red') +  # Reference line
  labs(title = "Actual vs. Predicted Scores",
       x = "Actual Scores",
       y = "Predicted Scores") +
  theme_minimal()

# Optionally, plot residuals to check for patterns
results <- results %>%
  mutate(Residuals = Actual - Predicted)

ggplot(results, aes(x = Predicted, y = Residuals)) +
  geom_point(color = 'darkgreen') +
  geom_hline(yintercept = 0, linetype = "dashed") +
  labs(title = "Residuals vs. Predicted Scores",
       x = "Predicted Scores",
       y = "Residuals") +
  theme_minimal()