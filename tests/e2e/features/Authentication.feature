Feature: User Authentication
  As a user
  I want to login to the admin panel
  So that I can access the dashboard and manage data

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I enter email "test@example.com"
    And I enter password "password123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see the dashboard page

  Scenario: Failed login with empty credentials
    When I click the login button
    Then I should see an error message
    And I should remain on the login page

  Scenario: Logout functionality
    Given I am logged in as "test@example.com"
    When I click the logout button
    Then I should be redirected to the login page
    And I should not see the dashboard

