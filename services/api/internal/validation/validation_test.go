package validation

import "testing"

func TestEmailValidation(t *testing.T) {
	if !Email("user@example.com") {
		t.Fatal("expected a valid email to pass")
	}
	if Email("not-an-email") {
		t.Fatal("expected malformed email to fail")
	}
}

func TestStatusAndPriorityValidation(t *testing.T) {
	if !Status("in_progress") || Status("blocked") {
		t.Fatal("status validation did not match allowed values")
	}
	if !Priority("urgent") || Priority("later") {
		t.Fatal("priority validation did not match allowed values")
	}
}
