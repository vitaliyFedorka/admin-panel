Feature: Dashboard
  As an admin user
  I want to view the dashboard
  So that I can see statistics and charts

  Background:
    Given I am logged in as "test@example.com"

  Scenario: View dashboard statistics
    When I navigate to the dashboard
    Then I should see the dashboard page
    And I should see statistics cards for:
      | Users |
      | Posts |
      | Todos |

  Scenario: View dashboard charts
    When I navigate to the dashboard
    Then I should see "Posts per User" chart
    And I should see "Todos Completion Status" chart
    And I should see "Todos Status by User" chart
    And I should see "Posts Distribution by User" chart

  Scenario: Dashboard shows correct user count
    When I navigate to the users page
    Then I see the total number of users
    When I navigate to the dashboard
    Then the user count on dashboard should match the users page count

