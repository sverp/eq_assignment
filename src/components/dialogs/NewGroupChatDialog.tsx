import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface NewGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (name: string, members: string[]) => void;
}

const NewGroupChatDialog = ({
  open,
  onOpenChange,
  onAddGroup,
}: NewGroupChatDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    if (members.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one member",
        variant: "destructive",
      });
      return;
    }

    onAddGroup(groupName.trim(), members);
    setGroupName("");
    setCurrentUsername("");
    setMembers([]);
    onOpenChange(false);
  };

  const handleAddMember = () => {
    if (!currentUsername.trim()) {
      return;
    }

    if (members.includes(currentUsername.trim())) {
      toast({
        title: "Error",
        description: "This user is already added to the group",
        variant: "destructive",
      });
      return;
    }

    setMembers([...members, currentUsername.trim()]);
    setCurrentUsername("");
  };

  const handleRemoveMember = (username: string) => {
    setMembers(members.filter((member) => member !== username));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="groupName" className="text-sm font-medium">
              Group Name
            </label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="members" className="text-sm font-medium">
              Add Members
            </label>
            <div className="flex gap-2">
              <Input
                id="members"
                placeholder="Enter username"
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddMember}>
                Add
              </Button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Members</label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {members.map((member) => (
                  <div
                    key={member}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatDialog;
