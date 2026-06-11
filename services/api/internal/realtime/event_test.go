package realtime

import "testing"

func TestEventVisibility(t *testing.T) {
	event := Event{UserID: "owner-1"}

	if !event.VisibleTo("owner-1", "member") {
		t.Fatal("expected owner to receive task event")
	}
	if event.VisibleTo("other-user", "member") {
		t.Fatal("expected unrelated member to be filtered out")
	}
	if !event.VisibleTo("admin-1", "admin") {
		t.Fatal("expected admin to receive all task events")
	}
}
