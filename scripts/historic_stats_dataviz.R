# Load necessary libraries
library(tidyverse)
library(plotly)

# Set the path to the directory containing the data files
data_dir <- '~/Desktop/cfbdata'  # Adjust this path if needed

# Read the data files
cfb_2013 <- read.csv(file.path(data_dir, 'cfb13.csv'))
cfb_2014 <- read.csv(file.path(data_dir, 'cfb14.csv'))
cfb_2015 <- read.csv(file.path(data_dir, 'cfb15.csv'))
cfb_2016 <- read.csv(file.path(data_dir, 'cfb16.csv'))
cfb_2017 <- read.csv(file.path(data_dir, 'cfb17.csv'))
cfb_2018 <- read.csv(file.path(data_dir, 'cfb18.csv'))
cfb_2019 <- read.csv(file.path(data_dir, 'cfb19.csv'))
cfb_2020 <- read.csv(file.path(data_dir, 'cfb20.csv'))
cfb_2021 <- read.csv(file.path(data_dir, 'cfb21.csv'))
cfb_2022 <- read.csv(file.path(data_dir, 'cfb22.csv'))
cfb_2023 <- read.csv(file.path(data_dir, 'cfb23.csv'))

# Select the first 25 rows of the 2023 data
data <- head(cfb_2023, 25)

# Convert data to a data frame
df <- as.data.frame(data)

# Bar plot for Total Points Per Game
plot1 <- ggplot(df, aes(x = reorder(Team, -Points.per.Game), y = Points.per.Game)) +
  geom_bar(stat = "identity", fill = "steelblue") +
  labs(title = "Total Points Per Game", x = "Team", y = "Points Per Game") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Scatter plot for Yards per Play Allowed vs. Yards per Game Allowed
plot2 <- ggplot(df, aes(x = Yards.Per.Game.Allowed, y = Yards.Play.Allowed)) +
  geom_point(color = "darkorange") +
  labs(title = "Defensive Efficiency: Yards per Play Allowed vs. Yards per Game Allowed", x = "Yards per Game Allowed", y = "Yards per Play Allowed") +
  theme_minimal()

# Line plot for Time of Possession per Game across teams
plot3 <- ggplot(df, aes(x = reorder(Team, Average.Time.of.Possession.per.Game), y = Average.Time.of.Possession.per.Game, group = 1)) +
  geom_line(color = "darkgreen") +
  geom_point(color = "darkgreen") +
  labs(title = "Average Time of Possession per Game by Team", x = "Team", y = "Time of Possession (minutes)") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Histogram of Turnover Margin
plot4 <- ggplot(df, aes(x = Turnover.Margin)) +
  geom_bar(stat = "count", fill = "blue", color = "black") +
  labs(title = "Distribution of Turnover Margin", x = "Turnover Margin", y = "Count") +
  theme_minimal()

# Displaying the ggplot2 plots (hashtag out the other plots to display one plot at a time)
print(plot1)
print(plot2)
print(plot3)
print(plot4)