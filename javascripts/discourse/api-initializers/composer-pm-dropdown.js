import { apiInitializer } from "discourse/lib/api";
import discourseComputed from "discourse/lib/decorators";
import {
  CREATE_SHARED_DRAFT,
  CREATE_TOPIC,
  PRIVATE_MESSAGE,
  REPLY,
} from "discourse/models/composer";
import { i18n } from "discourse-i18n";

// Component can get destroyed and lose state
let _topicSnapshot = null;
let _postSnapshot = null;

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("component:composer-actions", {
    pluginId: "composer-pm-dropdown",

    @discourseComputed("seq")
    content() {
      let items = [];

      if (
        this.action === REPLY &&
        this.topic &&
        this.topic.isPrivateMessage &&
        this.topic.details &&
        (this.topic.details.allowed_users.length > 1 ||
          this.topic.details.allowed_groups.length > 0) &&
        !this.isEditing &&
        _topicSnapshot
      ) {
        items.push({
          name: i18n(
            "composer.composer_actions.reply_as_new_group_message.label"
          ),
          description: i18n(
            "composer.composer_actions.reply_as_new_group_message.desc"
          ),
          icon: "plus",
          id: "reply_as_new_group_message",
        });
      }

      if (
        this.action !== CREATE_TOPIC &&
        this.action !== CREATE_SHARED_DRAFT &&
        this.action === REPLY &&
        this.topic &&
        !this.topic.isPrivateMessage &&
        !this.isEditing &&
        _topicSnapshot
      ) {
        items.push({
          name: i18n("composer.composer_actions.reply_as_new_topic.label"),
          description: i18n(
            "composer.composer_actions.reply_as_new_topic.desc"
          ),
          icon: "plus",
          id: "reply_as_new_topic",
        });
      }

      if (
        (this.action !== REPLY && _postSnapshot) ||
        (this.action === REPLY &&
          _postSnapshot &&
          !(this.replyOptions.userAvatar && this.replyOptions.userLink))
      ) {
        items.push({
          name: i18n("composer.composer_actions.reply_to_post.label", {
            postUsername: _postSnapshot.username,
          }),
          description: i18n("composer.composer_actions.reply_to_post.desc"),
          icon: "share",
          id: "reply_to_post",
        });
      }

      if (
        this.get("currentUser.can_send_private_messages") &&
        this.action !== PRIVATE_MESSAGE &&
        !this.isEditing
      ) {
        items.push({
          name: i18n(
            themePrefix(
              "custom_composer_actions.reply_as_private_message.label"
            )
          ),
          description: i18n(
            themePrefix("custom_composer_actions.reply_as_private_message.desc")
          ),
          icon: "envelope",
          id: "reply_as_private_message",
        });
      }

      if (
        !this.isEditing &&
        ((this.action !== REPLY && _topicSnapshot) ||
          (this.action === REPLY &&
            _topicSnapshot &&
            this.replyOptions.userAvatar &&
            this.replyOptions.userLink &&
            this.replyOptions.topicLink))
      ) {
        items.push({
          name: i18n("composer.composer_actions.reply_to_topic.label"),
          description: i18n("composer.composer_actions.reply_to_topic.desc"),
          icon: "share",
          id: "reply_to_topic",
        });
      }

      // if answered post is a whisper, we can only answer with a whisper so no need for toggle
      if (
        this.canWhisper &&
        (!this.replyOptions.postLink ||
          !_postSnapshot ||
          _postSnapshot.post_type !== this.site.post_types.whisper)
      ) {
        items.push({
          name: i18n("composer.composer_actions.toggle_whisper.label"),
          description: i18n("composer.composer_actions.toggle_whisper.desc"),
          icon: "far-eye-slash",
          id: "toggle_whisper",
        });
      }

      if (this.action === CREATE_TOPIC) {
        if (this.site.shared_drafts_category_id) {
          // Shared Drafts Choice
          items.push({
            name: i18n("composer.composer_actions.shared_draft.label"),
            description: i18n("composer.composer_actions.shared_draft.desc"),
            icon: "far-clipboard",
            id: "shared_draft",
          });
        }
      }

      const showToggleTopicBump =
        this.get("currentUser.staff") ||
        this.get("currentUser.trust_level") === 4;

      if (this.action === REPLY && showToggleTopicBump) {
        items.push({
          name: i18n("composer.composer_actions.toggle_topic_bump.label"),
          description: i18n("composer.composer_actions.toggle_topic_bump.desc"),
          icon: "anchor",
          id: "toggle_topic_bump",
        });
      }

      if (items.length === 0) {
        items.push({
          name: i18n("composer.composer_actions.create_topic.label"),
          description: i18n(
            "composer.composer_actions.reply_as_new_topic.desc"
          ),
          icon: "share",
          id: "create_topic",
        });
      }

      return items;
    },
  });
});
