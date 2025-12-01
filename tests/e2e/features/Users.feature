Feature: Users Management
  As an admin user
  I want to manage users
  So that I can perform CRUD operations on user data

  Background:
    Given I am logged in as "test@example.com"
    And I navigate to the users page

  Scenario: View users list
    Then I should see a table with users
    And I should see at least one user in the table

  Scenario: Create a new user
    When I click the "Add User" button
    And I fill in the user form with:
      | field   | value           |
      | name    | John Doe        |
      | username| johndoe         |
      | email   | john@example.com|
      | phone   | 123-456-7890    |
    And I submit the form
    Then I should see "John Doe" in the users table
    And the modal should be closed

  Scenario: Edit an existing user
    Given there is a user "John Doe" in the table
    When I click the "Edit" button for "John Doe"
    And I change the name to "Jane Doe"
    And I submit the form
    Then I should see "Jane Doe" in the users table
    And I should not see "John Doe" in the users table

  Scenario: Delete a user
    Given there is a user "John Doe" in the table
    When I click the "Delete" button for "John Doe"
    And I confirm the deletion
    Then I should not see "John Doe" in the users table

  Scenario: Sort users by name
    When I click on the "Name" column header
    Then the users should be sorted by name in ascending order
    When I click on the "Name" column header again
    Then the users should be sorted by name in descending order

